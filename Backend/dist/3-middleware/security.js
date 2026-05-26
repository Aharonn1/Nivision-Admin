"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityAuditor = exports.threatLogs = exports.blockedIpsList = exports.limiter = exports.getSystemHealth = exports.getSystemMetrics = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const os_1 = __importDefault(require("os"));
const getSystemMetrics = () => {
    return {
        cpuUsage: os_1.default.loadavg()[0], // ממוצע עומס CPU
        freeMemory: os_1.default.freemem() / 1024 / 1024 / 1024, // זיכרון פנוי ב-GB
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
// 1. הגנה מפני התקפות Brute Force
// חוסם IP ששולח יותר מ-100 בקשות ב-15 דקות
exports.limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
// הוסף ייצוא של המערך כדי שנוכל לגשת אליו ב-app.ts
exports.blockedIpsList = [];
exports.threatLogs = [];
const securityAuditor = (req, res, next) => {
    const suspiciousPaths = ['/admin', '/config', '/.env', '/etc/passwd'];
    if (suspiciousPaths.some(path => req.path.includes(path))) {
        // הוספת אובייקט עשיר במידע
        exports.threatLogs.push({
            ip: req.ip || "unknown",
            timestamp: new Date().toISOString(),
            path: req.path
        });
    }
    next();
};
exports.securityAuditor = securityAuditor;
