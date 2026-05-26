import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import os from 'os';

export const getSystemMetrics = () => {
    return {
        cpuUsage: os.loadavg()[0],
        freeMemory: os.freemem() / 1024 / 1024 / 1024,
        uptime: os.uptime(),
    };
};

export const getSystemHealth = () => {
    return {
        cpuLoad: os.loadavg()[0].toFixed(2),
        freeMemGB: (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
        totalMemGB: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    };
};

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

interface IThreat {
    ip: string;
    timestamp: string;
    path: string;
}

export const threatLogs: IThreat[] = [];

export const securityAuditor = (req: Request, res: Response, next: NextFunction) => {
    const suspiciousPaths = ['/api/admin', '/admin', '/config', '/.env', '/etc/passwd'];
    
    if (suspiciousPaths.some(path => req.path.startsWith(path))) {
        
        

    const threatData = {
    ip: req.ip || "unknown",
    timestamp: new Date().toISOString(),
    path: req.path,
    fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl, // הכתובת המלאה!
    userAgent: req.headers['user-agent']
    };

        threatLogs.push(threatData);

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