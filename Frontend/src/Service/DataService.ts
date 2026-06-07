import axios from "axios";
import { LoanLeadModel } from "../models/LoanLeadModel";
import appConfig from "../Utils/AppConfig";


export interface AWSCostMetric {
  service: string;
  amount: string;
  unit: string;
}

export interface CPUData {
  timestamp: string;
  value: number;
}

const dataService = {
  /**
   * פונקציה 1: משיכת נתונים מה-Workflow המקורי (כולל AI)
   */

async getAgentInsights(): Promise<any[]> {
    try {
      // שינוי קריטי: שימוש ב-appConfig במקום כתובת קשיחה עם פורט 5678
      const url = appConfig.employeesUrl;
      const response = await axios.get<any>(url);

      const rawOutput = response.data.leads?.[0]?.output || "";
      if (!rawOutput) return [];

      const cleanJson = rawOutput.replace(/```json|```/g, "").trim();

      try {
        const insights = JSON.parse(cleanJson);
        return Array.isArray(insights) ? insights : [];
      } catch (parseError) {
        return [];
      }
    } catch (error) {
      console.error("DataService Error (Strategic Analysis):", error);
      return [];
    }

  },

  
  async getNvisionLeads(): Promise<LoanLeadModel[]> {
    try {
      const url = appConfig.leadsUrl; // פונה ל-nivision-leads-list
      const response = await axios.post<any>(url, {
        action: "get_leads",
        context: "dashboard_charts"
      });

      const data = response.data.leads || response.data
      return Array.isArray(data) ? data : [];
    } catch (error) {
      this.handleError(error);
      return []; // מבטיח שהפונקציה תמיד תחזיר מערך ולא תשבור את ה-TypeScript
    }
  },

  /**
   * פונקציה 2: משיכת נתונים מה-Workflow המשוכפל (נקי, ללא AI)
   */
async getRawLeadsData(): Promise<LoanLeadModel[]> {
  try {
    const url = appConfig.leadsFinal; 
    const response = await axios.post<any>(url, {
      action: "fetch_raw_data"
    });

    // חילוץ המערך - ב-Postgres זה בדרך כלל חוזר ישירות כמערך
    const rawItems = Array.isArray(response.data) ? response.data : (response.data.leads || []);

    if (!Array.isArray(rawItems)) return [];

    const mappedData = rawItems.map((item: any) => {
      // בגלל שזה מגיע מה-DB שלך, אנחנו לוקחים את השדות ישירות מה-item
      return {
        ...item, // זה יכניס את כל השדות החדשים (amount, city, ai_summary וכו')
        id: item.id || item.hs_object_id || Math.random().toString(),
        // התאמה למה שמרכיבי ה-UI שלך מצפים (כמו firstname)
        firstname: item.name || item.firstname || "ללא שם", 
        email: item.email || "ללא מייל",
      };
    });
    return mappedData;

  } catch (error) {
    this.handleError(error);
    return [];
  }
},

  /**
   * פונקציה 4: ניתוח אסטרטגי - עובדת דרך AppConfig (מאובטח)
   */
  async getStrategicLeadsAnalysis(): Promise<any[]> {
    try {
      // שינוי קריטי: שימוש ב-appConfig כדי לעבור דרך ה-CloudFront המאובטח
      const url = appConfig.loeses_leadsUrl;
      const response = await axios.get<any>(url);
      let rawOutput = response.data.leads?.[0]?.output || "";
      if (!rawOutput) return [];

      const cleanJson = rawOutput.replace(/```json|```/g, "").trim();

      try {
        const insights = JSON.parse(cleanJson);
        return Array.isArray(insights) ? insights : [];
      } catch (parseError) {
        console.error("DataService: JSON Parse Error", cleanJson);
        return [];
      }
    } catch (error) {
      console.error("DataService Error (Strategic Analysis):", error);
      return [];
    }
  },



  async getFinancialStats(): Promise<any> {
    try {
        // אנחנו פונים דרך ה-Config לכתובת המאובטחת של הדומיין
        const url = appConfig.financialUrl; 

        const response = await axios.get<any>(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching financial stats from n8n:", error);
        return {
            total_capital: 0,
            total_loaned: 0,
            liquidity: 0,
            client_count: 0,
            funding_breakdown: []
        };
    }
},

 async getAllUsers(): Promise<any[]> {
    try {
        // שליפה אוטומטית מתוך הזיכרון של הדפדפן
        const storedId = localStorage.getItem("userId");
        if (!storedId) {
            console.warn("No userId found in localStorage");
            return [];
        }
        const url = `${appConfig.baseUrl}/webhook/get-all-users`;
        
        // שליחת ה-ID ל-n8n בתוך ה-Params
        const response = await axios.get(url, {
            params: { requesterId: storedId }
        });
        return response.data.users || [];
    } catch (error) {
        console.error("Error fetching users from n8n:", error);
        throw error;
    }
},

async getAllAnalyses(): Promise<any[]> {
  try {
    const url = appConfig.callAnalysis;
    const response = await axios.get<any>(url);
    // שליפת הנתונים מהמבנה של n8n
    const rawData = response.data.leads?.[0]?.output || response.data;
    if (!Array.isArray(rawData)) return [];

    return rawData.map((item: any) => {
      const props = item.properties || {};
      
      // חילוץ ופענוח הניתוח מתוך marital_status
      let internalAnalysis = {};
      const rawMarital = props.marital_status?.value || props.marital_status;
      if (rawMarital && typeof rawMarital === 'string') {
        try {
          internalAnalysis = JSON.parse(rawMarital);
        } catch (e) {
          console.error("Service: Error parsing marital_status JSON", e);
        }
      }

      // הזרקת הנתונים המפוענחים לתוך האובייקט שהקומפוננטה מקבלת
      return {
        ...item,
        parsedAnalysis: internalAnalysis
      };
    });
  } catch (error) {
    console.error("Service Error:", error);
    return [];
  }
},

async getSystemHealth(): Promise<any> {
    try {
        const url = `${appConfig.baseUrl}/webhook/get-health-status`;
        const response = await axios.get(url);
        
        // n8n מחזיר לעיתים מערך, אנחנו לוקחים את האיבר הראשון
        const rawData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        // כאן הקסם: Redis שומר את זה כטקסט, אז אנחנו הופכים אותו חזרה לאובייקט
        // אם זה כבר אובייקט, הוא פשוט יחזור כמו שהוא
        const finalData = typeof rawData.propertyName === 'string' 
            ? JSON.parse(rawData.propertyName) 
            : rawData;

        return finalData;
    } catch (error) {
        console.error("Error fetching health status:", error);
        return null;
    }
},

// Frontend/src/Service/DataService.ts

async updateSyncFrequency(minutes: number): Promise<void> {
    try {
        // אנחנו שולחים את הערך למפתח הספציפי ש-n8n מחפש
        await axios.post(`${appConfig.baseUrl}/update-redis`, {
            key: 'system_sync_frequency',
            value: minutes.toString()
        });
    } catch (error) {
        console.error("Error updating sync frequency:", error);
        throw error;
    }
},

// Frontend/src/Service/DataService.ts

async getLatestSyncLogs(): Promise<any> {
    try {
        // שים לב: תוודא שזו הכתובת המדויקת מה-Production URL ב-n8n
        const n8nUrl = 'https://api.nivision-leads.net/webhook/get-system-health';
        
        const response = await axios.get(n8nUrl);
        // אם ה-Redis החזיר JSON כסטרינג, אנחנו מפרססים אותו
        let data = response.data;
        
        // אם n8n עטף את זה בתוך אובייקט עם propertyName
        if (data.propertyName) {
            data = data.propertyName;
        }

        const finalData = typeof data === 'string' ? JSON.parse(data) : data;
        
        return finalData;
    } catch (error) {
        console.error("Error: Could not fetch from n8n. Check CORS or URL.", error);
        return null;
    }
},

 async getAWSCosts(): Promise<AWSCostMetric[]> {
        try {
            const response = await axios.get<AWSCostMetric[]>(appConfig.awsCostUrl);
            return response.data;
        } catch (error) {
            console.error("Error in getAWSCosts:", error);
            throw error;
        }
    },

    async getUserLogins() {
    try {
      // הקריאה מתבצעת ל-Webhook של n8n שמוגדר על ה-EC2 שלך
      const response = await axios.get(appConfig.adminAccessLogsUrl);
      // מחזיר את מערך האובייקטים שעבר Parse ב-n8n
      return response.data;
    } catch (error) {
      console.error('Error fetching user access logs from NiVision API:', error);
      throw error;
    }
  },

  // DataService.ts

async getSystemIntelligence() {
  try {
    // פנייה ל-Webhook החדש שיצרנו ב-n8n
    const response = await axios.get(appConfig.monitorStatus);
    return response.data;
  } catch (error) {
    console.error('NiVision Intelligence Error:', error);
    throw error;
  }
},

// בתוך הקלאס DataService
async getSecurityIntelligence() {
    try {
        // שים לב שהנתיב תואם למה שהגדרת ב-n8n (security)
        const response = await axios.get(appConfig.securityUrl);
        return response.data;
    } catch (error) {
        console.error("Security Audit Fetch Failed:", error);
        throw error;
    }
},

// בתוך הקלאס DataService
async getInfraHealth() {
    try {
        // שים לב שהנתיב תואם למה שהגדרת ב-n8n (security)
        const response = await axios.get(appConfig.pm2Url);
        return response.data;
    } catch (error) {
        console.error("Security Audit Fetch Failed:", error);
        throw error;
    }
},

// בתוך הקלאס DataService
async getCrmHubspot() {
    try {
        // שים לב שהנתיב תואם למה שהגדרת ב-n8n (security)
        const response = await axios.get(appConfig.crmUrl);
        return response.data;
    } catch (error) {
        console.error("Security Audit Fetch Failed:", error);
        throw error;
    }
},

async getContainer() {
    try {
        // שים לב שהנתיב תואם למה שהגדרת ב-n8n (security)
        const response = await axios.get(appConfig.containerUrl);
        return response.data;
    } catch (error) {
        console.error("Security Audit Fetch Failed:", error);
        throw error;
    }
},

async getsyStemStats() {
    try {
        // שים לב שהנתיב תואם למה שהגדרת ב-n8n (security)
        const response = await axios.get(appConfig.systemStatsUrl);
        return response.data;
    } catch (error) {
        console.error("Security Audit Fetch Failed:", error);
        throw error;
    }
},

async getPermissions() {
    try {
        // שים לב שהנתיב תואם למה שהגדרת ב-n8n (security)
        const response = await axios.post(appConfig.getPermissionsUrl);
        return response.data;
    } catch (error) {
        console.error("Security Audit Fetch Failed:", error);
        throw error;
    }
},
  handleError(error: any): void {
    console.error("DataService Error:", error);
  }
};



// ✅ הוספת ה-export החסר
export default dataService;