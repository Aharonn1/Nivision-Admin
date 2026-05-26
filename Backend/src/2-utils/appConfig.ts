// src/2-utils/appConfig.ts

import dotenv from "dotenv";

// טעינת משתני הסביבה
dotenv.config();

interface IAppConfig {
    port: number;
    mysqlHost: string;
    mysqlUser: string;
    mysqlPassword: string;
    mysqlDatabase: string;
    imagesUrl: string;
}

class AppConfig implements IAppConfig {

    public port = 4050;

    // הגדרות מסד הנתונים מתוך ה-env
    public mysqlHost = process.env.DB_HOST || "localhost"; 
    public mysqlUser = process.env.DB_USER || "root";
    public mysqlPassword = process.env.DB_PASSWORD || "";

    // ✅ השם החדש והמנצח של המוצר שלך
    public mysqlDatabase = process.env.DB_NAME || "braingine_db"; 

    // כתובת גנרית לתמונות
    public imagesUrl = `http://localhost:${this.port}/api/images/`;
}

const appConfig = new AppConfig();

export default appConfig;