import express, { Request, Response, NextFunction } from "express";
import { awsService } from "../5-services/awsService";

const router = express.Router();

router.get("/metrics/cpu", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ה-ID של השרת שלך
        const instanceId = "i-03a459ea9a19bd36a"; 
        const cpuUsage = await awsService.getCpuUsage(instanceId);
        
        res.json({ cpuUsage: cpuUsage.toFixed(2) });
    } catch (error) {
        next(error); // מעביר לשכבת ה-error handling של האפליקציה
    }
});

// ב-systemRoutes.ts
router.get("/system/intelligence", async (req, res, next) => {
    try {
        const intel = await awsService.getSystemIntelligence();
        res.json(intel);
    } catch (err) {
        next(err);
    }
});

export default router;