"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerFromText = getAnswerFromText;
const natural = __importStar(require("natural")); // שימוש בייבוא * כפי שהופיע בקוד ה-TS המקורי
const dal_js_1 = __importDefault(require("./2-utils/dal.js"));
// פונקציית עזר לבדיקה בטוחה של מערך (שם תואם ל-JS)
function ArrayOfObjects(arr) {
    return Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object';
}
// פונקציית עזר לחילוץ משפט רלוונטי
function extractRelevantSentence(shoe, keywords) {
    const text = shoe.ai_description || shoe.description;
    if (!text)
        return "";
    const sentences = text.split(/[.!?]/);
    for (const sentence of sentences) {
        for (const keyword of keywords) {
            if (sentence.toLowerCase().includes(keyword))
                return sentence.trim() + ".";
        }
    }
    return text.substring(0, 100) + "...";
}
// ======================================================
// פונקציית עזר חדשה: טיפול בהשוואות 
// ======================================================
async function handleComparisonRequest(query) {
    // 1. ניקוי אגרסיבי: מחיקת סימנים (כמו פסיקים) ופירוק
    const cleanQuery = query.toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace("which is better", "")
        .replace("between", "")
        .trim();
    // 2. פירוק לשני צדדים
    let parts = [];
    if (cleanQuery.includes(" vs ")) {
        parts = cleanQuery.split(" vs ");
    }
    else if (cleanQuery.includes(" or ")) {
        parts = cleanQuery.split(" or ");
    }
    else if (cleanQuery.includes(" compare ")) {
        parts = cleanQuery.split(" compare ");
    }
    else {
        return null;
    }
    const candidateA = parts[0].trim();
    const candidateB = parts[1].trim();
    if (candidateA.length < 2 || candidateB.length < 2)
        return null;
    console.log(`🔎 Comparing Cleaned Inputs: [${candidateA}] vs [${candidateB}]`);
    // 3. שליפת כל השמות
    const sqlAll = "SELECT shoesId, title FROM shoes";
    const allShoes = await dal_js_1.default.execute(sqlAll);
    // 4. חיפוש גמיש
    const shoeMatchA = allShoes.find(s => s.title.toLowerCase().includes(candidateA));
    const shoeMatchB = allShoes.find(s => s.title.toLowerCase().includes(candidateB));
    if (!shoeMatchA || !shoeMatchB) {
        console.log("❌ Could not match both names. Fallback to standard search.");
        return null;
    }
    console.log(`✅ Match Found: [${shoeMatchA.title}] vs [${shoeMatchB.title}]`);
    // 5. שאילתת הסטטיסטיקה 
    const sqlStats = `
        SELECT 
            s.shoesId, 
            s.title, 
            s.price,
            s.ai_description,
            s.description,
            (SELECT COUNT(*) FROM orders o WHERE o.shoesId = s.shoesId) as sales_count,
            (SELECT COUNT(*) FROM favorite f WHERE f.shoesId = s.shoesId) as likes_count,
            (SELECT COUNT(*) FROM comments c WHERE c.shoesId = s.shoesId) as comments_count
        FROM shoes s
        WHERE s.shoesId IN (${shoeMatchA.shoesId}, ${shoeMatchB.shoesId})
    `;
    const statsResults = await dal_js_1.default.execute(sqlStats);
    // חישוב ניקוד
    const scoredShoes = statsResults.map(s => {
        const score = (s.sales_count * 5) + (s.comments_count * 2) + (s.likes_count * 1);
        return { ...s, total_score: score };
    });
    // מיון יורד (הגבוה מנצח)
    scoredShoes.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    const winner = scoredShoes[0];
    const loser = scoredShoes[1];
    // הוק רגשי (משפט ראשון מהתיאור)
    let emotionalHook = "";
    const fullDesc = winner.ai_description || winner.description;
    if (fullDesc) {
        const firstSentence = fullDesc.split('.')[0];
        if (firstSentence.length > 5)
            emotionalHook = `"${firstSentence}."`;
    }
    // תשובה סופית
    if (winner.total_score === loser.total_score) {
        return `It's a tie! Both **${winner.title}** and **${loser.title}** are equally popular. Choose based on style!`;
    }
    return `I analyzed the data for you! 🤓
    
    I recommend the **${winner.title}**.
    ${emotionalHook} ✨
    
    Here is why it wins:
    🏆 **Best Seller:** ${winner.sales_count} orders (vs ${loser.sales_count}).
    💬 **Buzz:** ${winner.comments_count} comments & ${winner.likes_count} likes.
    
    The stats show **${winner.title}** is the clear favorite.`;
}
// ======================================================
// הפונקציה הראשית
// ======================================================
async function getAnswerFromText(query, productId) {
    // --- שלב 0: בדיקת השוואה ---
    try {
        const comparisonAnswer = await handleComparisonRequest(query);
        if (comparisonAnswer) {
            return comparisonAnswer;
        }
    }
    catch (err) {
        console.error("Comparison logic error:", err);
    }
    const lowerQuery = query.toLowerCase();
    // ======================================================
    // 1. שלב "הברמן": שאלות כמות, קטגוריות, מחיר וחיפוש משולב 🍹
    // ======================================================
    if (lowerQuery.includes("how many") || lowerQuery.includes("show me") || lowerQuery.includes("list") ||
        lowerQuery.includes("do you have") || lowerQuery.includes("under") || lowerQuery.includes("over") ||
        lowerQuery.includes("cheapest") || lowerQuery.includes("expensive") || lowerQuery.includes("least") || lowerQuery.includes("most") ||
        lowerQuery.includes("size") || lowerQuery.includes("color")) { // הוספת size/color לבדיקה הראשונית (כמו ב-JS)
        console.log("🔍 Smart Search triggered...");
        try {
            let sql = "SELECT s.*, s.price FROM shoes s"; // הוספת s.price כפי שהיה ב-JS המקורי
            let joins = "";
            let conditions = [];
            // ✅ מערך למעקב אחרי מילים שטופלו ב-SQL (כפי שהיה ב-JS)
            let handledWords = [];
            // --- א. זיהוי קטגוריה ---
            let foundCategory;
            const catSql = "SELECT * FROM categoryshoes";
            const allCategories = await dal_js_1.default.execute(catSql);
            if (ArrayOfObjects(allCategories)) {
                foundCategory = allCategories.find((c) => {
                    const name = (c.categoryName || c.name || c.title || "").toLowerCase();
                    if (lowerQuery.includes(name)) {
                        handledWords.push(name); // ✅ טיפלנו במילה הזו
                        return true;
                    }
                    return false;
                });
                if (foundCategory)
                    conditions.push(`s.categoryId = ${foundCategory.categoryId}`);
            }
            // --- ב. זיהוי מידה ---
            const sizeMatch = lowerQuery.match(/size\s*(\d+)/);
            if (sizeMatch) {
                const requestedSize = sizeMatch[1];
                handledWords.push("size", requestedSize); // ✅ טיפלנו במידה
                joins = " JOIN shoesize sz ON s.shoesId = sz.shoesId";
                conditions.push(`sz.sizeId = ${requestedSize} AND sz.stock > 0`);
            }
            // --- ג. זיהוי צבע ---
            const knownColors = ["black", "white", "red", "blue", "green", "yellow", "orange", "purple", "grey", "gray", "pink", "brown", "gold", "silver"];
            const foundColor = knownColors.find(color => lowerQuery.includes(color));
            if (foundColor) {
                handledWords.push(foundColor); // ✅ טיפלנו בצבע
                conditions.push(`s.color LIKE '%${foundColor}%'`);
            }
            // --- ד. זיהוי טווחי מחיר ומיון ---
            let sortOrder = null;
            const underMatch = lowerQuery.match(/(?:under|less than|cheaper than|below)\s*(\d+)/);
            if (underMatch) {
                const maxPrice = parseInt(underMatch[1]);
                conditions.push(`s.price <= ${maxPrice}`);
            }
            const overMatch = lowerQuery.match(/(?:over|more than|expensive than|above)\s*(\d+)/);
            if (overMatch) {
                const minPrice = parseInt(overMatch[1]);
                conditions.push(`s.price >= ${minPrice}`);
            }
            if (lowerQuery.includes("cheapest") || lowerQuery.includes("least expensive")) {
                sortOrder = 'ASC';
            }
            else if (lowerQuery.includes("most expensive") || lowerQuery.includes("highest price")) {
                sortOrder = 'DESC';
            }
            // --- ביצוע השאילתה ---
            if (conditions.length > 0 || sortOrder || lowerQuery.includes("show me")) {
                sql += joins;
                if (conditions.length > 0) {
                    sql += " WHERE " + conditions.join(" AND ");
                }
                if (sortOrder) {
                    sql += ` ORDER BY s.price ${sortOrder}`;
                }
                else {
                    sql += " GROUP BY s.shoesId";
                }
                const results = await dal_js_1.default.execute(sql);
                if (results.length > 0) {
                    // --- ו. סינון סמנטי חכם (התיקון: דילוג על מילים שטופלו) ---
                    const stopWordsForSemantic = ["cheapest", "expensive", "shoe", "shoes", "most", "least", "good", "best", "for", "the", "me", "show", "list", "in", "with"];
                    const featureKeywords = lowerQuery.split(/[\s?.,!]+/)
                        .filter(w => w.length > 2)
                        .filter(w => !stopWordsForSemantic.includes(w))
                        .filter(w => !handledWords.includes(w)) // ✅ לא לחפש בתיאור מילים שכבר סיננו ב-SQL!
                        .filter(w => isNaN(Number(w)));
                    console.log("📝 Keywords left for description check:", featureKeywords);
                    let finalCandidates = results;
                    if (featureKeywords.length > 0) {
                        finalCandidates = results.filter(s => {
                            const desc = (s.ai_description || s.description || "").toLowerCase();
                            const title = s.title.toLowerCase();
                            return featureKeywords.every(kw => desc.includes(kw) || title.includes(kw));
                        });
                    }
                    // Fallback: אם הסינון הסמנטי מחק הכל אבל ה-SQL מצא תוצאות מדויקות, נחזיר את ה-SQL
                    if (finalCandidates.length === 0 && results.length > 0) {
                        console.log("⚠️ Reverting to SQL results as description check filtered everything.");
                        finalCandidates = results;
                    }
                    // סיכום הממצאים (TOP 3)
                    const topResults = finalCandidates.slice(0, 3);
                    const shoesList = topResults.map(s => `${s.title} (${s.price}₪)`).join(", ");
                    let intro = `I found ${finalCandidates.length} shoes matching your request.`;
                    if (sortOrder) {
                        intro = `The ${sortOrder === 'ASC' ? 'cheapest' : 'most expensive'} options are:`;
                    }
                    return `${intro} ${shoesList}.`;
                }
                else {
                    return `I couldn't find any shoes matching that specific combination.`;
                }
            }
        }
        catch (err) {
            console.error("💥 Error in smart search:", err);
            return "Sorry, I ran into a technical issue while searching.";
        }
    }
    // ======================================================
    // 2. חיפוש נעל ספציפית (לפי שם או לפי הקשר) 🧠
    // ======================================================
    let shoe;
    if (productId && productId > 0) {
        const sql = `SELECT * FROM shoes WHERE shoesId = ${productId}`;
        const result = await dal_js_1.default.execute(sql);
        shoe = result[0];
    }
    else {
        const sql = "SELECT * FROM shoes";
        const allShoes = await dal_js_1.default.execute(sql);
        const stopWords = ["what", "which", "is", "the", "best", "good", "for", "shoe", "shoes", "are", "do", "you", "have", "tell", "me", "about", "show", "under", "over"];
        const cleanQuery = lowerQuery.split(/[\s?.,!]+/).filter(w => !stopWords.includes(w)).join(" ");
        const titleCandidates = allShoes.filter(s => s.title.toLowerCase().includes(cleanQuery) || cleanQuery.includes(s.title.toLowerCase()));
        if (titleCandidates.length > 0) {
            titleCandidates.sort((a, b) => Math.abs(a.title.length - cleanQuery.length) - Math.abs(b.title.length - cleanQuery.length));
            shoe = titleCandidates[0];
        }
        else {
            let bestShoeMatch;
            let maxKeywordsFound = 0;
            const searchKeywords = lowerQuery.split(" ").filter(w => w.length > 3 && !stopWords.includes(w));
            for (const s of allShoes) {
                const desc = (s.ai_description || s.description || "").toLowerCase();
                let matches = 0;
                for (const keyword of searchKeywords) {
                    if (desc.includes(keyword))
                        matches++;
                }
                if (matches > maxKeywordsFound) {
                    maxKeywordsFound = matches;
                    bestShoeMatch = s;
                }
            }
            if (bestShoeMatch && maxKeywordsFound > 0) {
                shoe = bestShoeMatch;
                return `Based on your request, I recommend the **${shoe.title}**. ${extractRelevantSentence(shoe, searchKeywords)}`;
            }
        }
    }
    if (!shoe) {
        return "Sorry, I couldn't find a specific shoe matching that description.";
    }
    // מחיר ומידות
    if (lowerQuery.includes("price") || lowerQuery.includes("cost"))
        return `The price of ${shoe.title} is ${shoe.price}₪.`;
    if (lowerQuery.includes("size")) {
        try {
            const sizeSql = `SELECT sizeId FROM shoesize WHERE shoesId = ${shoe.shoesId} AND stock > 0 ORDER BY sizeId`;
            const sizesResult = await dal_js_1.default.execute(sizeSql);
            if (sizesResult && sizesResult.length > 0)
                return `Available sizes for ${shoe.title}: ${sizesResult.map(item => item.sizeId).join(', ')}`;
            return `Sorry, currently out of stock.`;
        }
        catch (err) {
            return `Found ${shoe.title}, but couldn't check sizes.`;
        }
    }
    // תיאור חכם
    const text = shoe.ai_description || shoe.description;
    if (!text || text.length < 10)
        return `Found ${shoe.title}. ${shoe.description || ""}`;
    const tokenizer = new natural.SentenceTokenizer([]);
    const sentences = tokenizer.tokenize(text);
    const queryTokens = new natural.WordTokenizer().tokenize(lowerQuery);
    let bestSentence = "";
    let bestScore = 0;
    for (const sentence of sentences) {
        let score = 0;
        const lowerSentence = sentence.toLowerCase();
        for (const token of queryTokens) {
            if (lowerSentence.includes(token) && token.length > 3)
                score++;
        }
        if (score > bestScore) {
            bestScore = score;
            bestSentence = sentence;
        }
    }
    if (bestScore > 0)
        return bestSentence;
    return `Info regarding ${shoe.title}: ${sentences[0]} ${sentences[1] || ""}`;
}
