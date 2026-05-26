"use strict";
// src/2-utils/dal.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise")); // ✅ שימוש בגרסת ה-promise לביצועים ונוחות
const appConfig_js_1 = __importDefault(require("./appConfig.js"));
// 1. יצירת ה-Pool בגרסת ה-Promise
// האנלוגיה: במקום טלפנית אחת (חיבור בודד), הקמנו "מרכזייה" (Pool) שמחלקת קווים פנויים
const pool = promise_1.default.createPool({
    host: appConfig_js_1.default.mysqlHost,
    user: appConfig_js_1.default.mysqlUser,
    password: appConfig_js_1.default.mysqlPassword,
    database: appConfig_js_1.default.mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 10, // מספר החיבורים המקבילים המקסימלי
    queueLimit: 0
});
/**
 * פונקציית ביצוע שאילתות כללית
 * ארכיטקטורה: תמיכה גם בחיבור רגיל מה-Pool וגם בחיבור טרנזקציה קיים
 */
async function execute(sql, values = [], connection = null) {
    const executor = connection || pool; // אם קיבלנו connection מ-beginTransaction, נשתמש בו
    const [result] = await executor.execute(sql, values);
    return result;
}
/**
 * התחלת טרנזקציה - קריטי ל-SaaS כשמעדכנים כמה טבלאות במקביל
 */
async function beginTransaction() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
}
/**
 * סגירת עסקה בהצלחה
 */
async function commit(connection) {
    await connection.commit();
    connection.release(); // החזרת הקו למרכזייה (Pool)
}
/**
 * ביטול עסקה במקרה של שגיאה
 */
async function rollback(connection) {
    try {
        await connection.rollback();
    }
    finally {
        connection.release(); // שחרור החיבור בכל מקרה
    }
}
// ייצוא אובייקט ה-DAL
exports.default = {
    execute,
    beginTransaction,
    commit,
    rollback
};
