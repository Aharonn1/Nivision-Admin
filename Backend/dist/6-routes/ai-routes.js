"use strict";
// import express, { Request, Response, NextFunction } from "express";
// import { chatWithGemini } from "../2-utils/ai-service.js";
// import tasksService from "../4-models/tasks-service.js";
// import ShoesModel from "../4-models/shoes-model.js";
// import { searchAllShoes } from "../5-services/ai-search-logic.js";
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// function formatProductForAI(shoe: ShoesModel): string {
//     return `Product Details: Name: ${shoe.title}, Price: ${shoe.price}, Color: ${shoe.color}, Description: ${shoe.description}`;
// }
// router.post("/ask-product", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const { question, productId } = request.body;
//         const productData = await tasksService.getOneProduct(productId);
//         if (!productData) return response.json({ answer: "מוצר לא נמצא." });
//         const contextString = formatProductForAI(productData);
//         // התיקון: איחוד השאילתה למחרוזת אחת עבור ה-SDK
//         const finalPrompt = `Context: ${contextString}\nQuestion: ${question}`;
//         const fullResponse = await chatWithGemini(finalPrompt);
//         response.json(fullResponse);
//     } catch (err: any) {
//         next(err);
//     }
// });
// router.post("/search", async (request: Request, response: Response, next: NextFunction) => {
//     try {
//         const { question, history } = request.body; // קבלת ההיסטוריה מהפרונט
//         console.log("🚀 Search request:", question);
//         // שליחת השאלה + ההיסטוריה ללוגיקה
//         const fullResponse = await searchAllShoes(question, history) as any;
//         response.json({
//             answer: fullResponse.answer,
//             shoes: fullResponse.shoes || []
//         });
//     } catch (err: any) {
//         next(err);
//     }
// });
// export default router;
