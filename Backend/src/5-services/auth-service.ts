import { AuthenticationError, ValidationError } from "../4-models/client-errors.js";
import RoleModel from "../4-models/role-model.js";
import UserModel from "../4-models/user-model.js";
import cyber from "../2-utils/cyber.js";
import { OkPacket } from "mysql";
import dal from "../2-utils/dal.js";

// --- Interfaces ---
interface LoginResponse {
    token: string;
    userData: UserModel;
}

interface CredentialsModel {
    email: string;
    password: string;
}
// 

// auth.service.ts

// ...
// src/5-services/auth-service.ts
async function register(user: UserModel): Promise<string> {
    
    // 1. אימות: ודא שהמייל לא תפוס
    if (await isEmailTaken(user.email)) {
        throw new ValidationError(`Email ${user.email} already taken`);
    }

    // 2. הגדרת ערכי ברירת מחדל לפני השליחה ל-DB
    // אנחנו מבטיחים ש-role ו-updateStock תמיד יקבלו ערך
    user.updateStock = 0;
    user.role = RoleModel.User; // וודא שזה מוגדר כ-"User" ב-Enum

    // 🎯 התיקון הקריטי: הוספת role לשאילתה (6 סימני שאלה!)
    const sql = `INSERT INTO users (firstName, lastName, email, password, updateStock, role) VALUES (?, ?, ?, ?, ?, ?)`; 
    
    // 🎯 התיקון הקריטי: הוספת user.role למערך הפרמטרים (6 ערכים!)
    const params = [
        user.firstName,
        user.lastName,
        user.email,
        user.password, 
        user.updateStock,
        user.role // השדה השישי שחסר ב-SQL שלך
    ];

    try {
        // 3. הרצת השאילתה בבסיס הנתונים
        const result: any = await dal.execute(sql, params); 
        
        // 4. עדכון ה-ID שנוצר וחזרה עם טוקן
        user.userId = result.insertId;

        console.log("✅ משתמש נרשם בהצלחה ב-DB עם ID:", user.userId);

        const token = cyber.createNewToken(user);
        return token;
    } 
    catch (err) {
        console.error("❌ שגיאה קריטית ב-Register Service:", err); 
        throw err; 
    }
}

async function login(credentials: CredentialsModel): Promise<LoginResponse> {

    // 🛑 בוטל: הגיבוב הוסר כדי להתאים לסיסמאות הגלויות ב-DB
    // const hashedPassword = cyber.hashPassword(credentials.password);

    try {
        const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

        // 🏆 תיקון: משתמשים בסיסמה הגלויה (credentials.password) כפרמטר
        const params = [credentials.email, credentials.password];
        const users: UserModel[] = await dal.execute(sql, params);

        if (users.length === 0) {
            throw new AuthenticationError("Incorrect email or password");
        }

        const user = users[0];
        const tokenData = cyber.createNewToken(user);

        return { token: tokenData, userData: user };

    } catch (error) {
        throw error;
    }
}

async function isEmailTaken(email: string): Promise<boolean> {

    const sql = `SELECT EXISTS(SELECT email FROM users WHERE email = ?) AS isExist`;

    // 🏆 התיקון המחייב: פרמטרים בתוך מערך
    const params = [email];
    const arr = await dal.execute(sql, params);

    // 🏆 ודא שאתה משתמש ב-isExist
    const isExist = arr[0].isExist;

    return isExist === 1;
}

export default {
    register,
    login,
    isEmailTaken
}
