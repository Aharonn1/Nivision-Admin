import jwt, { JsonWebTokenError } from "jsonwebtoken";
import UserModel from "../4-models/user-model.js";
import RoleModel from "../4-models/role-model.js";
import { AuthenticationError } from "../4-models/client-errors.js";
import { Request } from "express";
import crypto from "crypto";

// **תיקון טיפוס:** הגדרה מפורשת של secretKey כ-string.
const secretKey: string = "4578-86 Students Are Amazing!";

/**
 * יוצר טוקן JWT חדש עבור המשתמש לאחר הסרת סיסמה.
 * @param user - אובייקט המשתמש.
 * @returns טוקן JWT.
 */
function createNewToken(user: UserModel): string {

    // ✅ תיקון TS2790: שימוש בפיזור (Destructuring) במקום delete
    // אנו מפיצים את האובייקט המקורי לכל הנכסים, למעט הסיסמה.
    const { password, ...safeUser } = user; 

    // Create container for the user object:
    const container = { user: safeUser }; // ✅ שימוש באובייקט הנקי (safeUser)

    // Create options:
    const options = { expiresIn: "7d" } as any; 
    
    // Create the token:
    const token = jwt.sign(container, secretKey, options);

    return token;
}

/**
 * מאמת את תוקף הטוקן באמצעות Promise.
 * @param request - אובייקט ה-Request.
 * @returns Promise של UserModel אם הטוקן תקין.
 */
function verifyToken(request: Request): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
        try {

            const header = request.header("authorization");

            if (!header) {
                reject(new AuthenticationError("Invalid token"));
                return;
            }

            const token = header.substring(7);

            if (!token) {
                reject(new AuthenticationError("Invalid token"));
                return;
            }

            // ✅ תיקון TS2769: הוספת אובייקט אפשרויות ריק {} כדי להפריד בין secretKey ל-callback
            // זה פותר את קונפליקט ה-Overload ב-TypeScript עבור jwt.verify
            jwt.verify(token, secretKey as string, {}, (err: JsonWebTokenError | null, container: any) => { 
                
                if (err) {
                    reject(new AuthenticationError("Invalid token"));
                    return;
                }
                
                // ✅ שימוש בבדיקה מפורשת כדי לוודא ש-container קיים
                if (!container || !container.user) {
                    reject(new AuthenticationError("Invalid token structure"));
                    return;
                }

                resolve(container.user as UserModel);
            });

        }
        catch (err: any) {
            reject(err);
        }
    })
}

async function verifyAdmin(request: Request): Promise<boolean> {
    const user = await verifyToken(request);
    return user.role === RoleModel.Admin;
}

function getUserFromToken(request: Request): UserModel {
    const header = request.header("authorization");
    if (!header) throw new AuthenticationError("Missing token"); 

    const token = header.substring(7);
    
    const user: UserModel = (jwt.decode(token) as any).user; 
    return user;

}

/**
 * מחזירה סיסמה מוצפנת.
 * @param plainText - הסיסמה בטקסט רגיל.
 * @returns סיסמה מוצפנת, או null אם הטקסט ריק.
 */
// ✅ תיקון TS2322: שינוי חתימת הפונקציה כדי לאפשר החזרת null
function hashPassword(plainText: string): string | null { 
    if (!plainText) return null; // ✅ עכשיו זה תקין
    const salt = "MakeThingsGoRight";
    const hashedPassword = crypto.createHmac("sha512", salt).update(plainText).digest("hex");
    return hashedPassword;
}

export default {
    createNewToken,
    verifyToken,
    hashPassword,
    verifyAdmin,
    getUserFromToken
}