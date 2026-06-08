import express from 'express';
import { SystemHealthService } from '../5-services/SystemHealthService';
import { awsService } from '../5-services/awsService'; // זה האובייקט עם getSystemIntelligence

const router = express.Router();
const systemService = new SystemHealthService();

// 1. נתוני בריאות מערכת (Latency, CPU מקומי, וכו')
router.get('/reliability', async (req, res) => {
    try {
        const metrics = await systemService.getReliabilityMetrics();
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: "Reliability probe failed" });
    }
});

// 2. נתוני אינטליגנציה ענן (ה-Promise.all המורכב שלך)
router.get('/system/intelligence', async (req, res, next) => {
    try {
        const intelligence = await awsService.getSystemIntelligence();
        res.json(intelligence);
    } catch (err) {
        next(err);
    }
});

// הוסף את זה בתוך ה-router
router.get('/aws', async (req, res, next) => {
    try {
        // הנחה: יש לך מתודה ב-systemService שמביאה את כל המדדים
        const awsData = await systemService.getAwsResources(); 
        res.json(awsData);
    } catch (err) {
        next(err);
    }
});

// הוספת ה-Endpoint שמחזיר את נתוני העלויות
router.get('/billing/trend', async (req, res) => {
    try {
        const costData = await awsService.getMonthlyCostTrend();
        res.status(200).json(costData);
    } catch (error) {
        res.status(500).json({ message: "שגיאה במשיכת נתוני עלויות AWS" });
    }
});

export default router;
