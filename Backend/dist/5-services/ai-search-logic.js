"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAllShoes = searchAllShoes;
const dal_js_1 = __importDefault(require("../2-utils/dal.js"));
const ai_service_js_1 = require("../2-utils/ai-service.js");
/**
 * חילוץ פילטרים טכניים מהשאלה כדי למנוע חרטוטים של ה-AI
 */
function extractFilters(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();
    // 1. חילוץ מידה (מספרים בין 35 ל-50)
    const sizeMatch = query.match(/\b(3[5-9]|4[0-9]|5[0])\b/);
    if (sizeMatch)
        filters.size = sizeMatch[0];
    // 2. חילוץ צבע
    const colors = ['black', 'white', 'gray', 'grey', 'red', 'blue', 'green', 'pink', 'orange', 'yellow'];
    const foundColor = colors.find(c => lowerQuery.includes(c));
    if (foundColor)
        filters.color = foundColor === 'grey' ? 'gray' : foundColor;
    // 3. חילוץ קטגוריה (לפי טבלת categoryshoes שלך)
    if (lowerQuery.includes('men') || lowerQuery.includes('גברים'))
        filters.categoryId = 1;
    if (lowerQuery.includes('women') || lowerQuery.includes('נשים'))
        filters.categoryId = 2;
    if (lowerQuery.includes('kids') || lowerQuery.includes('ילדים'))
        filters.categoryId = 3;
    return filters;
}
async function searchAllShoes(userQuestion, history = []) {
    try {
        const filters = extractFilters(userQuestion);
        const userVector = await (0, ai_service_js_1.createEmbedding)(userQuestion);
        const userVectorJsonString = JSON.stringify(userVector);
        let whereClauses = [];
        let params = [userVectorJsonString];
        if (filters.color) {
            whereClauses.push(`s.color LIKE ?`);
            params.push(`%${filters.color}%`);
        }
        if (filters.categoryId) {
            whereClauses.push(`s.categoryId = ?`);
            params.push(filters.categoryId);
        }
        let sizeJoin = "";
        if (filters.size) {
            sizeJoin = `JOIN shoesize sz ON s.shoesId = sz.shoesId`;
            whereClauses.push(`sz.sizeId = ? AND sz.stock > 0`);
            params.push(filters.size);
        }
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : "";
        const vectorSearchSql = `
            SELECT DISTINCT s.shoesId, s.title, s.ai_description, s.categoryId, s.price, s.ShoppingBasket as shoppingBasket, s.color, 
            c.categoryName, (1 - (s.embedding <=> ?)) AS similarity
            FROM shoes s
            JOIN categoryshoes c ON s.categoryId = c.categoryId
            ${sizeJoin}
            ${whereSql}
            ORDER BY similarity DESC
            LIMIT 25;
        `;
        const filteredProducts = await dal_js_1.default.execute(vectorSearchSql, params);
        let contextForAI = [];
        if (filteredProducts.length > 0) {
            const shoeIds = filteredProducts.map(p => p.shoesId).join(',');
            const sizesSql = `SELECT shoesId, sizeId, stock FROM shoesize WHERE shoesId IN (${shoeIds}) AND stock > 0;`;
            const availableSizes = await dal_js_1.default.execute(sizesSql);
            contextForAI = filteredProducts.map((p) => {
                const sizes = availableSizes.filter(s => s.shoesId === p.shoesId)
                    .map(s => `${s.sizeId}`)
                    .join(', ');
                const finalPrice = p.shoppingBasket === 1 ? (p.price * 0.8).toFixed(2) : p.price.toFixed(2);
                return {
                    id: p.shoesId,
                    title: p.title,
                    category: p.categoryName,
                    price: `₪${finalPrice}`,
                    color: p.color,
                    stock_info: sizes || 'OUT OF STOCK'
                };
            });
        }
        const fullPrompt = `
            STRICT NIKE INVENTORY AGENT.
            You are helping a customer. Use ONLY the data below.
            
            USER FILTERS: ${JSON.stringify(filters)}.
            DATABASE RESULTS: ${JSON.stringify(contextForAI)}.

            STRICT INSTRUCTIONS:
            1. ONLY list shoes that are present in the 'DATABASE RESULTS'.
            2. If the user asked for a specific size (${filters.size || 'any'}), verify it is listed in 'stock_info'.
            3. If the user asked for a specific color (${filters.color || 'any'}), only show matches.
            4. If the user asked for a specific category (${filters.categoryId ? 'Category ID ' + filters.categoryId : 'any'}), ensure the 'category' name in the results matches their intent.
            5. Do NOT show or mention any "Product ID" in your response.
            6. If no shoes exactly match the request, say: "I'm sorry, we don't have those specific shoes in stock right now."
            7. Use ₪ for prices.

            Question: ${userQuestion}
        `;
        const finalResponse = await (0, ai_service_js_1.chatWithGemini)(fullPrompt, history);
        return {
            answer: finalResponse.answer || finalResponse.text,
            context: { products: filteredProducts }
        };
    }
    catch (error) {
        console.error("❌ RAG Search Failed:", error.message);
        return { answer: "מצטער, חלה שגיאה בגישה למסד הנתונים.", context: {} };
    }
}
