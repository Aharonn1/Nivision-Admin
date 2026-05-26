"use strict";
// src/2-utils/appConfig.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// טעינת משתני הסביבה
dotenv_1.default.config();
class AppConfig {
    port = 4050;
    // הגדרות מסד הנתונים מתוך ה-env
    mysqlHost = process.env.DB_HOST || "localhost";
    mysqlUser = process.env.DB_USER || "root";
    mysqlPassword = process.env.DB_PASSWORD || "";
    // ✅ השם החדש והמנצח של המוצר שלך
    mysqlDatabase = process.env.DB_NAME || "braingine_db";
    // כתובת גנרית לתמונות
    imagesUrl = `http://localhost:${this.port}/api/images/`;
}
const appConfig = new AppConfig();
exports.default = appConfig;
