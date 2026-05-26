"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dal_js_1 = __importDefault(require("../2-utils/dal.js"));
const ai_service_js_1 = require("../2-utils/ai-service.js");
class BraingineService {
    async addKnowledge() {
        try {
            const sqlSelect = "SELECT shoesId, title, description, color, price FROM shoes";
            const shoes = await dal_js_1.default.execute(sqlSelect);
            if (!shoes || shoes.length === 0)
                return;
            console.log(`🚀 מעבד ${shoes.length} נעליים...`);
            for (const shoe of shoes) {
                const contentToVectorize = `מוצר: ${shoe.title}. תיאור: ${shoe.description}. צבע: ${shoe.color}.`.trim();
                // יצירת הוקטור - הפונקציה עכשיו מובטחת להחזיר מערך מספרים
                const vector = await (0, ai_service_js_1.createEmbedding)(contentToVectorize);
                // המרה לפורמט JSON STRING תקין עבור עמודת ה-VECTOR או ה-JSON ב-MySQL
                const vectorJson = JSON.stringify(vector);
                // עדכון טבלת shoes
                const sqlUpdate = "UPDATE shoes SET embedding = ? WHERE shoesId = ?";
                // שליחת ה-JSON התקין
                await dal_js_1.default.execute(sqlUpdate, [vectorJson, shoe.shoesId]);
                console.log(`✅ עודכן וקטור תקין לנעל: ${shoe.title}`);
            }
        }
        catch (error) {
            console.error("❌ שגיאה ב-Ingest:", error.message);
            throw error;
        }
    }
}
const braingineService = new BraingineService();
exports.default = braingineService;
