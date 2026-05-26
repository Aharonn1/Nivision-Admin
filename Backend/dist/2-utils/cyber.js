"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const role_model_js_1 = __importDefault(require("../4-models/role-model.js"));
const client_errors_js_1 = require("../4-models/client-errors.js");
const crypto_1 = __importDefault(require("crypto"));
// **תיקון טיפוס:** הגדרה מפורשת של secretKey כ-string.
const secretKey = "4578-86 Students Are Amazing!";
/**
 * יוצר טוקן JWT חדש עבור המשתמש לאחר הסרת סיסמה.
 * @param user - אובייקט המשתמש.
 * @returns טוקן JWT.
 */
function createNewToken(user) {
    // ✅ תיקון TS2790: שימוש בפיזור (Destructuring) במקום delete
    // אנו מפיצים את האובייקט המקורי לכל הנכסים, למעט הסיסמה.
    const { password, ...safeUser } = user;
    // Create container for the user object:
    const container = { user: safeUser }; // ✅ שימוש באובייקט הנקי (safeUser)
    // Create options:
    const options = { expiresIn: "7d" };
    // Create the token:
    const token = jsonwebtoken_1.default.sign(container, secretKey, options);
    return token;
}
/**
 * מאמת את תוקף הטוקן באמצעות Promise.
 * @param request - אובייקט ה-Request.
 * @returns Promise של UserModel אם הטוקן תקין.
 */
function verifyToken(request) {
    return new Promise((resolve, reject) => {
        try {
            const header = request.header("authorization");
            if (!header) {
                reject(new client_errors_js_1.AuthenticationError("Invalid token"));
                return;
            }
            const token = header.substring(7);
            if (!token) {
                reject(new client_errors_js_1.AuthenticationError("Invalid token"));
                return;
            }
            // ✅ תיקון TS2769: הוספת אובייקט אפשרויות ריק {} כדי להפריד בין secretKey ל-callback
            // זה פותר את קונפליקט ה-Overload ב-TypeScript עבור jwt.verify
            jsonwebtoken_1.default.verify(token, secretKey, {}, (err, container) => {
                if (err) {
                    reject(new client_errors_js_1.AuthenticationError("Invalid token"));
                    return;
                }
                // ✅ שימוש בבדיקה מפורשת כדי לוודא ש-container קיים
                if (!container || !container.user) {
                    reject(new client_errors_js_1.AuthenticationError("Invalid token structure"));
                    return;
                }
                resolve(container.user);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
async function verifyAdmin(request) {
    const user = await verifyToken(request);
    return user.role === role_model_js_1.default.Admin;
}
function getUserFromToken(request) {
    const header = request.header("authorization");
    if (!header)
        throw new client_errors_js_1.AuthenticationError("Missing token");
    const token = header.substring(7);
    const user = jsonwebtoken_1.default.decode(token).user;
    return user;
}
/**
 * מחזירה סיסמה מוצפנת.
 * @param plainText - הסיסמה בטקסט רגיל.
 * @returns סיסמה מוצפנת, או null אם הטקסט ריק.
 */
// ✅ תיקון TS2322: שינוי חתימת הפונקציה כדי לאפשר החזרת null
function hashPassword(plainText) {
    if (!plainText)
        return null; // ✅ עכשיו זה תקין
    const salt = "MakeThingsGoRight";
    const hashedPassword = crypto_1.default.createHmac("sha512", salt).update(plainText).digest("hex");
    return hashedPassword;
}
exports.default = {
    createNewToken,
    verifyToken,
    hashPassword,
    verifyAdmin,
    getUserFromToken
};
