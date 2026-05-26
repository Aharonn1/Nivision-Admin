"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const dotenv_1 = __importDefault(require("dotenv"));
const prom_client_1 = __importDefault(require("prom-client"));
const route_not_found_1 = __importDefault(require("./3-middleware/route-not-found"));
const catch_all_1 = __importDefault(require("./3-middleware/catch-all"));
const file_utils_1 = require("./2-utils/file-utils");
// --- ייבוא נתיבים (Routes) ---
// import authRoutes from "./6-routes/auth-routes";
// import taskRoutes from "./6-routes/task-routes";
// import aiRoutes from "./6-routes/ai-routes";
// import adminRoutes from "./6-routes/admin-routes";
// import braingineController from "./6-routes/braingine-controller";
const security_1 = require("./3-middleware/security");
// החלת ההגנה על כל הנתיבים של ה-API
// 1. טעינת משתני סביבה
dotenv_1.default.config();
const server = (0, express_1.default)();
// --- 📊 הגדרת Metrics (Prometheus) ---
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
const httpRequestCounter = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestCounter);
// Middleware לתיעוד בקשות
server.use((req, res, next) => {
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
server.use("/api/", security_1.limiter);
server.use(security_1.securityAuditor);
server.use((0, cors_1.default)(corsOptions));
server.use(express_1.default.json());
server.use((0, express_fileupload_1.default)());
// --- נתיבים ---
server.get("/api/health", (req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
server.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});
// מערך זמני בזיכרון (בשלב הבא נעביר את זה ל-Redis)
const blockedIpsList = [];
server.get("/api/security/threats", (req, res) => {
    res.json({ blockedIps: blockedIpsList });
});
server.get("/api/system/health", (req, res) => {
    res.json((0, security_1.getSystemHealth)());
});
// סטטיים
server.use("/api/images", express_1.default.static("/home/ubuntu/backend/dist/1-assets/images/images"));
// נתיבי API
// server.use("/api", authRoutes);
// server.use("/api", taskRoutes);
// server.use("/api", aiRoutes);
// server.use("/api", braingineController);
// server.use("/api/admin", adminRoutes);
// טיפול בשגיאות
server.use(route_not_found_1.default);
server.use(catch_all_1.default);
// --- 5. הפעלת השרת ---
(async () => {
    try {
        await (0, file_utils_1.ensureAllAssetsCopied)();
        // המרה מפורשת למספר בעזרת Number()
        const port = Number(process.env.PORT) || 3001;
        server.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Nivision Intelligence Backend is running on port ${port}`);
        });
    }
    catch (err) {
        console.error("❌ Critical Failure:", err);
        process.exit(1);
    }
})();
