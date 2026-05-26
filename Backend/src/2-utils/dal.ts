// src/2-utils/dal.ts

import mysql from "mysql2/promise"; // ✅ שימוש בגרסת ה-promise לביצועים ונוחות
import appConfig from "./appConfig.js";

// 1. יצירת ה-Pool בגרסת ה-Promise
// האנלוגיה: במקום טלפנית אחת (חיבור בודד), הקמנו "מרכזייה" (Pool) שמחלקת קווים פנויים
const pool = mysql.createPool({
    host: appConfig.mysqlHost,
    user: appConfig.mysqlUser,
    password: appConfig.mysqlPassword,
    database: appConfig.mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 10, // מספר החיבורים המקבילים המקסימלי
    queueLimit: 0
});

/**
 * פונקציית ביצוע שאילתות כללית
 * ארכיטקטורה: תמיכה גם בחיבור רגיל מה-Pool וגם בחיבור טרנזקציה קיים
 */
async function execute(sql: string, values: any[] = [], connection: any = null): Promise<any> {
    const executor = connection || pool; // אם קיבלנו connection מ-beginTransaction, נשתמש בו
    const [result] = await executor.execute(sql, values);
    return result;
}

/**
 * התחלת טרנזקציה - קריטי ל-SaaS כשמעדכנים כמה טבלאות במקביל
 */
async function beginTransaction(): Promise<mysql.PoolConnection> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
}

/**
 * סגירת עסקה בהצלחה
 */
async function commit(connection: mysql.PoolConnection): Promise<void> {
    await connection.commit();
    connection.release(); // החזרת הקו למרכזייה (Pool)
}

/**
 * ביטול עסקה במקרה של שגיאה
 */
async function rollback(connection: mysql.PoolConnection): Promise<void> {
    try {
        await connection.rollback();
    } finally {
        connection.release(); // שחרור החיבור בכל מקרה
    }
}

// ייצוא אובייקט ה-DAL
export default {
    execute,
    beginTransaction,
    commit,
    rollback
};