"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getInventoryAlerts_js_1 = require("../getInventoryAlerts.js");
// אם הלוגיקה בתיקייה "5-logic", ייתכן שתצטרך לשנות ל: "../5-logic/admin-logic"
const router = express_1.default.Router();
// הראוט: הנתיב הסופי יהיה /api/admin/alerts
router.get("/alerts", async (request, response, next) => {
    try {
        const alerts = await (0, getInventoryAlerts_js_1.getInventoryAlerts)();
        response.json(alerts);
    }
    catch (err) {
        next(err);
    }
});
// כתובת מלאה: /api/admin/returns
router.get("/returns", async (request, response, next) => {
    try {
        const returns = await (0, getInventoryAlerts_js_1.getProductReturnAlerts)();
        response.json(returns);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
