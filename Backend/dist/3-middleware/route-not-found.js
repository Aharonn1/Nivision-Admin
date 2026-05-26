"use strict";
// import { RouteNotFoundError } from "../4-models/client-errors.js"; // זה הנתיב הנכון
// import { Request, Response, NextFunction } from "express";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// function routeNotFound(request: Request, response: Response, next: NextFunction): void {
//     // Create route-not-found error
//     const err = new RouteNotFoundError(request.originalUrl);
//     // Send to catch-all middleware:
//     next(err);
// }
// export default routeNotFound;
// 3-middleware/route-not-found.js
const path_1 = __importDefault(require("path"));
// שימוש ב-process.cwd() כדי לקבוע את השורש הגלובלי של הפרויקט
const routeNotFound = (request, response, next) => {
    // ✅ תיקון: שימוש בנתיב המלא שמצביע על תיקיית ה-assets בתוך dist
    const filePath = path_1.default.join(process.cwd(), "dist", "1-assets", "images", "pageNotFound.png");
    response.status(404).sendFile(filePath, err => {
        if (err) {
            // אם ה-404 נכשל, נחזיר שגיאת טקסט
            console.error("Failed to send 404 image:", err);
            response.status(404).send("הדף אינו קיים - 404");
        }
    });
};
exports.default = routeNotFound;
