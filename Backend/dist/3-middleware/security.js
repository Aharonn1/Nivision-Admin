"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityAuditor = exports.threatLogs = exports.limiter = exports.getSystemHealth = exports.getSystemMetrics = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const os_1 = __importDefault(require("os"));
const getSystemMetrics = () => {
    return {
        cpuUsage: os_1.default.loadavg()[0],
        freeMemory: os_1.default.freemem() / 1024 / 1024 / 1024,
        uptime: os_1.default.uptime(),
    };
};
exports.getSystemMetrics = getSystemMetrics;
const getSystemHealth = () => {
    return {
        cpuLoad: os_1.default.loadavg()[0].toFixed(2),
        freeMemGB: (os_1.default.freemem() / 1024 / 1024 / 1024).toFixed(2),
        totalMemGB: (os_1.default.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    };
};
exports.getSystemHealth = getSystemHealth;
exports.limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.threatLogs = [];
const securityAuditor = (req, res, next) => {
    const suspiciousPaths = ['/api/admin', '/admin', '/config', '/.env', '/etc/passwd'];
    if (suspiciousPaths.some(path => req.path.startsWith(path))) {
        const threatData = {
            ip: req.ip || "unknown",
            timestamp: new Date().toISOString(),
            path: req.path,
            fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl, // הכתובת המלאה!
            userAgent: req.headers['user-agent']
        };
        exports.threatLogs.push(threatData);
        // כאן הקסם: הדפסה לטרמינל בצורה ברורה
        console.log("------------------------------------------");
        console.log("🚨 SECURITY ALERT - THREAT DETECTED 🚨");
        console.log("SOURCE IP: ", threatData.ip);
        console.log("TIME:      ", threatData.timestamp);
        console.log("PATH:      ", threatData.path);
        console.log("DEVICE:    ", threatData.userAgent);
        console.log("------------------------------------------");
    }
    next();
};
exports.securityAuditor = securityAuditor;
