import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import expressFileUpload from "express-fileupload";
import dotenv from "dotenv";
import client from "prom-client";

// --- ייבוא כלי עזר ו-Middleware (ללא סיומת .js) ---
import AppConfig from "./2-utils/appConfig";
import routeNotFound from "./3-middleware/route-not-found";
import catchAll from "./3-middleware/catch-all";
import { ensureAllAssetsCopied } from "./2-utils/file-utils";

// --- ייבוא נתיבים (Routes) ---
// import authRoutes from "./6-routes/auth-routes";
// import taskRoutes from "./6-routes/task-routes";
// import aiRoutes from "./6-routes/ai-routes";
// import adminRoutes from "./6-routes/admin-routes";
// import braingineController from "./6-routes/braingine-controller";
import { getSystemHealth, limiter, securityAuditor, threatLogs } from "./3-middleware/security";

// החלת ההגנה על כל הנתיבים של ה-API

// 1. טעינת משתני סביבה
dotenv.config();

const server = express();

// --- 📊 הגדרת Metrics (Prometheus) ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });




const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);
server.set('trust proxy', 1); // זה מאפשר לשרת "לראות" את ה-IP האמיתי של המשתמש דרך ה-Proxy
// Middleware לתיעוד בקשות
server.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        if (req.route) {
            httpRequestCounter.labels(req.method, req.route.path, res.statusCode.toString()).inc();
        }
    });
    next();
});

// --- הגדרת Middleware גלובלי ---
const corsOptions = {
    origin: ["http://localhost:3000", "https://www.shoes-shop-pro.com", "https://shoes-shop-pro.com"],
    credentials: true,
};

server.use("/api/", limiter);
server.use(securityAuditor);
server.use(cors(corsOptions));
server.use(express.json());
server.use(expressFileUpload());

// --- נתיבים ---
server.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

server.get("/metrics", async (req: Request, res: Response) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

// מערך זמני בזיכרון (בשלב הבא נעביר את זה ל-Redis)
const blockedIpsList: string[] = [];

server.get("/api/security/threats", (req, res) => {
     console.log("Current threatLogs:", threatLogs);
    res.json({ blockedIps: threatLogs }); 
});

server.get("/api/system/health", (req, res) => {
    res.json(getSystemHealth());
});

// סטטיים
server.use("/api/images", express.static("/home/ubuntu/backend/dist/1-assets/images/images"));

// נתיבי API
// server.use("/api", authRoutes);
// server.use("/api", taskRoutes);
// server.use("/api", aiRoutes);
// server.use("/api", braingineController);
// server.use("/api/admin", adminRoutes);

// טיפול בשגיאות
server.use(routeNotFound);
server.use(catchAll);

// --- 5. הפעלת השרת ---
(async () => {
    try {
        await ensureAllAssetsCopied();
        // המרה מפורשת למספר בעזרת Number()
        const port = Number(process.env.PORT) || 3001;
        
        server.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Nivision Intelligence Backend is running on port ${port}`);
        });
    } catch (err) {
        console.error("❌ Critical Failure:", err);
        process.exit(1);
    }
})();