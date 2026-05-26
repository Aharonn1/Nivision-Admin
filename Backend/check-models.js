// check-models.js
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    console.log("🔍 בודק איזה מודלים פתוחים עבורך...");
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ שגיאה כללית:", data.error.message);
            return;
        }

        console.log("✅ הנה המודלים הזמינים לך:");
        console.log("--------------------------------");
        
        // סינון רק למודלים שיודעים לייצר טקסט (generateContent)
        const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        
        chatModels.forEach(model => {
            console.log(`📌 שם המודל: ${model.name.replace("models/", "")}`);
        });
        
        console.log("--------------------------------");
        console.log("👉 תעתיק את אחד השמות האלו בדיוק לקובץ ai-service.ts");

    } catch (error) {
        console.error("❌ תקלה בבדיקה:", error.message);
    }
}

listModels();