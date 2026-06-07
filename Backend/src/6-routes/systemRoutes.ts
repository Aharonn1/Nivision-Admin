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

export default router;
