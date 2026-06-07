import axios from "axios";
import appConfig from "../Utils/AppConfig";

// ממשק התגובה מה-AI
interface AiResponse {
    answer: string;
    text?: string;
    context: any;
}

class AiService {
    private lastProductsList: string[] = [];

    // עדכון הזיכרון של הסוכן לצורך שאלות המשך
    private updateMemory(aiResponse: string): void {
        const matches = aiResponse.match(/\*\*([^*]+?)\*\*/g);
        if (matches) {
            this.lastProductsList = matches.map(m => m.replace(/\*\*/g, '').trim());
        } else {
            this.lastProductsList = [];
        }
    }

    public async askQuestion(
        question: string,
        productId?: number,
        context?: any
    ): Promise<AiResponse> {

        const url = appConfig.leadsUrl;
        const requestData = {
            question: question,
            productId: productId || 0,
            chatContext: context || {}
        };

        try {            
            const response = await axios.post(url, requestData, {
                headers: { 'Content-Type': 'application/json' }
            });

            let botText = "";
            const data = response.data;

            // 1. נסיון חילוץ ממערך (המבנה שראינו ב-image_fa8236.jpg)
            if (Array.isArray(data) && data[0] && data[0].output && data[0].output[0]) {
                botText = data[0].output[0].content[0].text;
            } 
            // 2. נסיון חילוץ מאובייקט ישיר (אם n8n ישנה התנהגות)
            else if (data.output && data.output[0] && data.output[0].content) {
                botText = data.output[0].content[0].text;
            }
            // 3. Fallback לשדות שטוחים
            else if (data.text || data.answer) {
                botText = data.text || data.answer;
            } else {
                botText = "הסוכן ענה, אך לא הצלחתי לחלץ את תוכן התשובה. בדוק את ה-Console.";
            }

            if (botText && botText !== "מחשב תשובה...") {
                this.updateMemory(botText);
            }

            return {
                answer: botText,
                text: botText,
                context: (Array.isArray(data) ? data[0].context : data.context) || {}
            };

        } catch (error) {
            console.error("❌ שגיאה ב-AiService:", error);
            let errorMessage = "שגיאת תקשורת מול השרת.";
            if (axios.isAxiosError(error) && error.response?.status === 500) {
                errorMessage = "שגיאת שרת פנימית (500) - וודא שה-n8n מופעל (Active).";
            }
            return { answer: errorMessage, text: errorMessage, context: {} };
        }
    }
}

const aiService = new AiService();
export default aiService;