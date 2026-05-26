"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_errors_js_1 = require("../4-models/client-errors.js");
const role_model_js_1 = __importDefault(require("../4-models/role-model.js"));
const cyber_js_1 = __importDefault(require("../2-utils/cyber.js"));
const dal_js_1 = __importDefault(require("../2-utils/dal.js"));
// 
// auth.service.ts
// ...
// src/5-services/auth-service.ts
async function register(user) {
    // 1. אימות: ודא שהמייל לא תפוס
    if (await isEmailTaken(user.email)) {
        throw new client_errors_js_1.ValidationError(`Email ${user.email} already taken`);
    }
    // 2. הגדרת ערכי ברירת מחדל לפני השליחה ל-DB
    // אנחנו מבטיחים ש-role ו-updateStock תמיד יקבלו ערך
    user.updateStock = 0;
    user.role = role_model_js_1.default.User; // וודא שזה מוגדר כ-"User" ב-Enum
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
        const result = await dal_js_1.default.execute(sql, params);
        // 4. עדכון ה-ID שנוצר וחזרה עם טוקן
        user.userId = result.insertId;
        console.log("✅ משתמש נרשם בהצלחה ב-DB עם ID:", user.userId);
        const token = cyber_js_1.default.createNewToken(user);
        return token;
    }
    catch (err) {
        console.error("❌ שגיאה קריטית ב-Register Service:", err);
        throw err;
    }
}
async function login(credentials) {
    // 🛑 בוטל: הגיבוב הוסר כדי להתאים לסיסמאות הגלויות ב-DB
    // const hashedPassword = cyber.hashPassword(credentials.password);
    try {
        const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
        // 🏆 תיקון: משתמשים בסיסמה הגלויה (credentials.password) כפרמטר
        const params = [credentials.email, credentials.password];
        const users = await dal_js_1.default.execute(sql, params);
        if (users.length === 0) {
            throw new client_errors_js_1.AuthenticationError("Incorrect email or password");
        }
        const user = users[0];
        const tokenData = cyber_js_1.default.createNewToken(user);
        return { token: tokenData, userData: user };
    }
    catch (error) {
        throw error;
    }
}
async function isEmailTaken(email) {
    const sql = `SELECT EXISTS(SELECT email FROM users WHERE email = ?) AS isExist`;
    // 🏆 התיקון המחייב: פרמטרים בתוך מערך
    const params = [email];
    const arr = await dal_js_1.default.execute(sql, params);
    // 🏆 ודא שאתה משתמש ב-isExist
    const isExist = arr[0].isExist;
    return isExist === 1;
}
exports.default = {
    register,
    login,
    isEmailTaken
};
