"use strict";
// main.ts
// ✅ שימוש בנתיב מוחלט יותר + ציון סיומת הקובץ
Object.defineProperty(exports, "__esModule", { value: true });
const rag_service_1 = require("./5-services/rag.service");
/**
 * מריץ את תהליך יצירת האינדקס של ה-RAG.
 */
async function main() {
    try {
        console.log("--- מתחיל את תהליך האינדקס הראשוני ---");
        // ודא שהנתיב ל-rag.service נכון!
        const vectorData = await (0, rag_service_1.initialRagIndexing)();
        if (vectorData) {
            console.log("\n========================================================");
            console.log(`✨ אינדקס ראשוני הושלם בהצלחה. נוצרו ${vectorData.length} וקטורים.`);
            console.log("========================================================");
        }
        else {
            console.log("❌ לא נוצר אינדקס. אנא בדוק את החיבור ל-DB.");
        }
    }
    catch (error) {
        console.error('💥 שגיאה קריטית בתהליך הראשי:', error);
    }
}
main();
