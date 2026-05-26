"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithGemini = chatWithGemini;
exports.createEmbedding = createEmbedding;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_KEY = process.env.GEMINI_API_KEY || "";
// הוספנו פרמטר history שמקבל את כל השיחה הקודמת
async function chatWithGemini(prompt, history = []) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        // בניית גוף ההודעה עם ההיסטוריה + ההודעה החדשה
        const response = await axios_1.default.post(url, {
            contents: [
                ...history, // כל מה שדיברנו עליו קודם
                { role: "user", parts: [{ text: prompt }] } // השאלה החדשה
            ]
        });
        const text = response.data.candidates[0].content.parts[0].text;
        return {
            answer: text,
            // אנחנו מחזירים את ההיסטוריה המעודכנת כדי שהצד לקוח ישמור אותה
            newHistory: [
                ...history,
                { role: "user", parts: [{ text: prompt }] },
                { role: "model", parts: [{ text: text }] }
            ]
        };
    }
    catch (error) {
        console.error("❌ API Error:", error.response?.data || error.message);
        return { answer: "שגיאת תקשורת. נסה שוב." };
    }
}
async function createEmbedding(text) {
    return new Array(768).fill(0);
}
