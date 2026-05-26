import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";

// הוספנו פרמטר history שמקבל את כל השיחה הקודמת
export async function chatWithGemini(prompt: string, history: { role: string, parts: { text: string }[] }[] = []) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        // בניית גוף ההודעה עם ההיסטוריה + ההודעה החדשה
        const response = await axios.post(url, {
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
    } catch (error: any) {
        console.error("❌ API Error:", error.response?.data || error.message);
        return { answer: "שגיאת תקשורת. נסה שוב." };
    }
}

export async function createEmbedding(text: string): Promise<number[]> {
    return new Array(768).fill(0);
}