const isProduction = true;

const PROD_URL = "https://www.shoes-shop-pro.com/api/";
const DEV_URL = "http://localhost:4050/api/";

const BASE_URL = isProduction ? PROD_URL : DEV_URL;

const STATIC_URL_ROOT = isProduction
  ? "https://www.shoes-shop-pro.com/"
  : "http://localhost:4050/";

// 3. הגדרת בסיס ל-n8n (Nivision Core)
// אנחנו רוצים תמיד לפנות לכתובת האמיתית של ה-n8n בשרת
const N8N_BASE = "https://api.nivision-leads.net";

class Config {
    // --- כתובות ה-Backend המקורי ---
    public updatePrice: string = BASE_URL + "mySales/";
    public usersForAdmin: string = BASE_URL + "usersForAdmin/";
    public updateSize: string = BASE_URL + "mySupply/";
    public mySupplyUrl: string = BASE_URL + "mySupply/";
    public repeatOrders: string = BASE_URL + "repeatOrders/";
    public ordersPerMonth: string = BASE_URL + "ordersPerMonth/";
    public categoryshoesUrl: string = BASE_URL + "categoryshoes/";
    public registerUrl: string = BASE_URL + "auth/register";
    // הכתובת הישירה והנקייה ל-Webhook של ה-Login
    public loginUrl: string = "https://api.nivision-leads.net/webhook/update-admin-profile";
    public askProductUrl: string = BASE_URL + "ask-product";
    public globalSearchUrl: string = BASE_URL + "search";
    public imagesUrl: string = STATIC_URL_ROOT + "api/images/";
    public shoesImagesUsersUrl: string = STATIC_URL_ROOT + "api/shoesUsers/images/";
    public adminAlertsUrl: string = BASE_URL + "admin/alerts";
    public adminReturnsUrl: string = BASE_URL + "admin/returns";
    public baseUrl = "https://api.nivision-leads.net"; // הכתובת של ה-n8n שלך
    // --- Nivision Webhooks (n8n Engine) ---
    // הכתובות עכשיו משתמשות ב-N8N_BASE הדינמי
    public leadsUrl: string = `${N8N_BASE}/webhook/nivision-leads-list`;
    public loeses_leadsUrl: string = `${N8N_BASE}/webhook/loeses_leads`;
    public leadsFinal: string = `${N8N_BASE}/webhook/leads-final`;
    public employeesUrl: string = `${N8N_BASE}/webhook/Employees-AI`;
    public financialUrl: string = `${N8N_BASE}/webhook/admin-financial-stats`;
    public callAnalysis: string = `${N8N_BASE}/webhook/get-all-analyses`;
    public awsCostUrl: string = `${N8N_BASE}/webhook/aws-costs`;
    public systemHealthUrl: string = `${N8N_BASE}/webhook/system-performance`;
    public adminAccessLogsUrl: string = `${N8N_BASE}/webhook/admin/access-logs`;
    public monitorStatus: string = `${N8N_BASE}/webhook/monitor-status`;
    public securityUrl: string = `${N8N_BASE}/webhook/security`;
    public pm2Url: string = `${N8N_BASE}/webhook/pm2`;
    public crmUrl: string = `${N8N_BASE}/webhook/crm-hubspot`;
    public containerUrl: string = `${N8N_BASE}/webhook/container`; 
    public systemStatsUrl: string = `${N8N_BASE}/webhook/system-stats`;     
    public getPermissionsUrl: string = `${N8N_BASE}/webhook/get-permissions`;     

}

const appConfig = new Config();
export default appConfig;