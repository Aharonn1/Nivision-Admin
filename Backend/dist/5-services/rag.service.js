"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmbedding = void 0;
exports.extractAndTransformData = extractAndTransformData;
exports.vectorizeChunks = vectorizeChunks;
exports.initialRagIndexing = initialRagIndexing;
const dotenv = __importStar(require("dotenv"));
const mysql = __importStar(require("mysql2/promise"));
// ייבוא עם סיומת .js וייצוא מחדש למניעת שגיאת TS2459
var ai_service_js_1 = require("../2-utils/ai-service.js");
Object.defineProperty(exports, "createEmbedding", { enumerable: true, get: function () { return ai_service_js_1.createEmbedding; } });
const ai_service_js_2 = require("../2-utils/ai-service.js");
dotenv.config();
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
};
async function extractAndTransformData() {
    let connection = null;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM shoes');
        return rows.map(row => `מוצר: ${row.title}. מחיר: ${row.price}. צבע: ${row.color}. תיאור: ${row.description}`);
    }
    catch (error) {
        return [];
    }
    finally {
        if (connection)
            await connection.end();
    }
}
async function vectorizeChunks(chunks) {
    if (!chunks || chunks.length === 0)
        return [];
    console.log(`\n🧠 מעבד ${chunks.length} פריטים...`);
    // משתמש בפונקציה מה-ai-service המקורי
    const promises = chunks.map(chunk => (0, ai_service_js_2.createEmbedding)(chunk));
    const results = await Promise.all(promises);
    return results.map((vec, i) => ({
        text: chunks[i],
        vector: vec,
    }));
}
async function initialRagIndexing() {
    const chunks = await extractAndTransformData();
    return await vectorizeChunks(chunks);
}
