import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import expressFileUpload from "express-fileupload";
import dotenv from "dotenv";
import client from "prom-client";
import systemRoutes from "./6-routes/systemRoutes";
import routeNotFound from "./3-middleware/route-not-found";
import catchAll from "./3-middleware/catch-all";
import { ensureAllAssetsCopied } from "./2-utils/file-utils";
import { getSystemHealth, limiter, securityAuditor, threatLogs } from "./3-middleware/security";

dotenv.config();
const server = express();

// --- 📊 Metrics ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);

// --- Middleware גלובלי ---
server.set('trust proxy', 1);

// התיקון הקריטי כאן:
server.use(cors({
    origin: '*', // לניפוי באגים: תן גישה מכל מקור. אחרי שזה יעבוד, תשנה ל-http://localhost:3000
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

server.use(express.json());
server.use(expressFileUpload());

// תיעוד בקשות ומדידה
server.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        if (req.route) httpRequestCounter.labels(req.method, req.route.path, res.statusCode.toString()).inc();
    });
    next();
});

// --- נתיבים ציבוריים ---
server.use("/api", systemRoutes); 

// --- אבטחה ומגבלות ---
server.use("/api/", limiter);
server.use(securityAuditor);

// --- נתיבי API נוספים ---
server.get("/api/health", (req, res) => res.status(200).json({ status: "UP", timestamp: new Date().toISOString() }));
server.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

server.get("/api/security/threats", (req, res) => res.json({ blockedIps: threatLogs }));
server.get("/api/system/health", (req, res) => res.json(getSystemHealth()));

// סטטיים
server.use("/api/images", express.static("/home/ubuntu/backend/dist/1-assets/images/images"));

// טיפול בשגיאות
server.use(routeNotFound);
server.use(catchAll);

// --- הפעלה ---
(async () => {
    try {
        await ensureAllAssetsCopied();
        const port = Number(process.env.PORT) || 3001;
        server.listen(port, '0.0.0.0', () => console.log(`🚀 Nivision Intelligence Backend is running on port ${port}`));
    } catch (err) {
        console.error("❌ Critical Failure:", err);
        process.exit(1);
    }
})();