"use strict";
// --- ממשקים (Interfaces) ---
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryAlerts = getInventoryAlerts;
exports.getProductReturnAlerts = getProductReturnAlerts;
exports.getMonthlySalesForecast = getMonthlySalesForecast;
exports.getLaggingProductAlerts = getLaggingProductAlerts;
const dal_js_1 = __importDefault(require("./2-utils/dal.js"));
// ======================================================
// 🧠 מודול AI מובנה: K-Means Clustering
// ======================================================
function analyzeShoePerformance(shoeData) {
    if (!shoeData || shoeData.length === 0) {
        return [];
    }
    // 1. יצירת features (פיצ'רים) עבור מודל ה-AI: [מכירות, מחיר]
    const features = shoeData.map((shoe) => [
        // משתנה 1: כמות המכירות שאושרה
        shoe.bought,
        // משתנה 2: המחיר שאושר
        shoe.price,
    ]);
    const K = 3; // מספר האשכולות
    const MAX_ITERATIONS = 50;
    const featureCount = features.length;
    // אם אין מספיק נתונים לקיבוץ, החזר מערך ריק.
    if (featureCount < K) {
        return shoeData.map((shoe) => ({
            ...shoe,
            Sales_Cluster: 0,
            IsLagging: false,
        }));
    }
    // --- מנוע K-Means מובנה ---
    const distance = (p1, p2) => Math.sqrt(p1.reduce((sum, val, i) => sum + (val - p2[i]) ** 2, 0));
    // 2. אתחול ראשוני (בחירת מרכזים רנדומליים)
    let centroids = [];
    const initialIndices = new Set();
    while (initialIndices.size < K) {
        initialIndices.add(Math.floor(Math.random() * featureCount));
    }
    centroids = Array.from(initialIndices).map((i) => features[i]);
    let clusters = Array(featureCount).fill(0);
    let changed = true;
    let iterations = 0;
    // 3. לולאת איטרציות לקיבוץ (Iterative Clustering)
    while (changed && iterations < MAX_ITERATIONS) {
        changed = false;
        iterations++;
        const newClusters = [];
        // 3.1 שלב ההצמדה (Assignment)
        for (let i = 0; i < featureCount; i++) {
            let minDistance = Infinity;
            let closestCluster = -1;
            for (let j = 0; j < K; j++) {
                const dist = distance(features[i], centroids[j]);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestCluster = j;
                }
            }
            newClusters.push(closestCluster);
            if (newClusters[i] !== clusters[i]) {
                changed = true;
            }
        }
        clusters = newClusters;
        // 3.2 שלב עדכון המרכזים (Update)
        const newCentroids = Array(K)
            .fill(0)
            .map(() => ({ sum: [0, 0], count: 0 }));
        for (let i = 0; i < featureCount; i++) {
            const clusterIndex = clusters[i];
            newCentroids[clusterIndex].sum[0] += features[i][0]; // מכירות
            newCentroids[clusterIndex].sum[1] += features[i][1]; // מחיר
            newCentroids[clusterIndex].count++;
        }
        for (let j = 0; j < K; j++) {
            if (newCentroids[j].count > 0) {
                centroids[j] = [
                    newCentroids[j].sum[0] / newCentroids[j].count,
                    newCentroids[j].sum[1] / newCentroids[j].count,
                ];
            }
            else {
                centroids[j] = features[Math.floor(Math.random() * featureCount)];
            }
        }
    }
    // ----------------------------------------------------
    // 4. ניתוח התוצאות (מציאת ה'חלש' - Lagging)
    // ----------------------------------------------------
    const clusterAverages = Array(K)
        .fill(0)
        .map((_, i) => ({ sum: 0, count: 0, id: i }));
    clusters.forEach((clusterId, index) => {
        // features[index][0] הוא ה-Bought/Sales Count
        clusterAverages[clusterId].sum += features[index][0];
        clusterAverages[clusterId].count++;
    });
    // מציאת האשכול עם המכירות הממוצעות הנמוכות ביותר
    const laggingCluster = clusterAverages.reduce((min, current) => current.count > 0 && current.sum / current.count < min.sum / min.count
        ? current
        : min, { sum: Infinity, count: 1, id: -1 });
    // 5. יצירת הנתונים הסופיים להחזרה
    const analyzedData = shoeData.map((shoe, index) => ({
        ...shoe,
        Sales_Cluster: clusters[index],
        IsLagging: clusters[index] === laggingCluster.id,
    }));
    console.log(`✅ AI Cluster Analysis completed in ${iterations} iterations.`);
    return analyzedData;
}
// ======================================================
// 1. פונקציה: התראות מלאי 🔮
// ======================================================
async function getInventoryAlerts() {
    const sql = `
        SELECT 
            s.shoesId, s.title,
            (SELECT IFNULL(SUM(stock), 0) FROM shoesize sz WHERE sz.shoesId = s.shoesId) as total_stock,
            (SELECT COUNT(*) FROM orders o 
             WHERE o.shoesId = s.shoesId 
             AND o.orderDate >= NOW() - INTERVAL 14 DAY) as sold_last_14_days
        FROM shoes s
        HAVING total_stock > 0 OR sold_last_14_days > 0
    `;
    const rawData = await dal_js_1.default.execute(sql);
    const alerts = [];
    for (const item of rawData) {
        const salesLast2Weeks = item.sold_last_14_days;
        const currentStock = Number(item.total_stock);
        if (salesLast2Weeks === 0)
            continue;
        const dailyVelocity = salesLast2Weeks / 14;
        const daysLeft = Math.floor(currentStock / dailyVelocity);
        if (daysLeft <= 7 || currentStock < 3) {
            let severity = 'warning';
            let msg = `⚠️ Warning: Stock runs out in ${daysLeft} days based on recent sales.`;
            const neededForMonth = Math.ceil(dailyVelocity * 30);
            const suggestedRestock = Math.max(0, neededForMonth - currentStock);
            if (daysLeft <= 3 || currentStock === 0) {
                severity = 'critical';
                msg = `🔥 CRITICAL: Stock hits ZERO in ${daysLeft} days! Selling fast!`;
            }
            alerts.push({
                shoesId: item.shoesId,
                title: item.title,
                currentStock: currentStock,
                dailyVelocity: parseFloat(dailyVelocity.toFixed(2)),
                daysLeft: daysLeft,
                suggestedOrder: suggestedRestock,
                message: msg,
                severity: severity
            });
        }
    }
    alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    return alerts;
}
// ======================================================
// 2. פונקציה: התראות החזרות 🛡️
// ======================================================
async function getProductReturnAlerts() {
    const sql = `
        SELECT 
            s.shoesId, s.title,
            COUNT(*) as total_sales,
            SUM(CASE WHEN o.status = 2 THEN 1 ELSE 0 END) as return_count,
            (SELECT comment 
             FROM orders o2 
             WHERE o2.shoesId = s.shoesId AND o2.status = 2
             GROUP BY comment 
             ORDER BY COUNT(*) DESC LIMIT 1) as top_reason
        FROM shoes s
        JOIN orders o ON s.shoesId = o.shoesId
        GROUP BY s.shoesId
        HAVING total_sales >= 3 AND return_count > 0
    `;
    const rawData = await dal_js_1.default.execute(sql);
    const alerts = [];
    for (const item of rawData) {
        const rate = item.return_count / item.total_sales;
        if (rate > 0.1) { // אם שיעור ההחזרות גבוה מ-10%
            let severity = 'warning';
            let action = "Check description.";
            const reason = (item.top_reason || "").toLowerCase();
            if (reason.includes("size") ||
                reason.includes("small") ||
                reason.includes("big") ||
                reason.includes("fit")) {
                action = "⚠️ Sizing Issue: Check size chart / Add 'Runs Small' tag.";
            }
            else if (reason.includes("damaged") ||
                reason.includes("tear") ||
                reason.includes("bad")) {
                severity = 'critical';
                action = "🔥 Quality Control: Defective batch detected! Stop selling.";
            }
            else if (reason.includes("color") ||
                reason.includes("picture") ||
                reason.includes("desc")) {
                action = "📸 Content Issue: Photo doesn't match product.";
            }
            if (rate > 0.4)
                severity = 'critical'; // החזרות מעל 40% הן קריטיות
            alerts.push({
                shoesId: item.shoesId,
                title: item.title,
                totalSales: item.total_sales,
                returnCount: Number(item.return_count),
                returnRate: (rate * 100).toFixed(0) + "%",
                topReason: item.top_reason || "Unknown",
                severity: severity,
                action: action,
            });
        }
    }
    alerts.sort((a, b) => parseFloat(b.returnRate) - parseFloat(a.returnRate));
    return alerts;
}
// ======================================================
// 3. פונקציה: תחזית מכירות חודשית 📈
// ======================================================
async function getMonthlySalesForecast() {
    const sql = `
        SELECT 
            s.shoesId, 
            s.title,
            (SELECT COUNT(*) FROM orders o 
             WHERE o.shoesId = s.shoesId 
             AND o.orderDate >= NOW() - INTERVAL 30 DAY) as sold_last_30_days
        FROM shoes s
        HAVING sold_last_30_days > 0
    `;
    const rawData = await dal_js_1.default.execute(sql);
    const forecastData = [];
    for (const item of rawData) {
        const salesLast30Days = Number(item.sold_last_30_days);
        const dailySalesRate = salesLast30Days / 30;
        const forecastedSales = Math.ceil(dailySalesRate * 30);
        forecastData.push({
            shoesId: item.shoesId,
            title: item.title,
            salesLast30Days: salesLast30Days,
            dailySalesRate: parseFloat(dailySalesRate.toFixed(2)),
            forecastedSales: forecastedSales,
            message: `📈 Projected to sell ${forecastedSales} units in the next 30 days.`,
        });
    }
    forecastData.sort((a, b) => b.forecastedSales - a.forecastedSales);
    return forecastData;
}
// ======================================================
// 4. פונקציה: התראות AI למוצרים חלשים במבצע 📉
// ======================================================
async function getLaggingProductAlerts() {
    const sql = `
-- 1. טבלת עזר: חישוב סך המכירות (bought) מתוך טבלת orders
WITH SalesData AS (
SELECT 
o.shoesId,
COUNT(*) as sold_last_30_days
FROM orders o 
WHERE o.orderDate >= NOW() - INTERVAL 30 DAY
GROUP BY o.shoesId
)
-- 2. בחירת הנתונים ל-AI
SELECT 
s.shoesId, 
s.title,
c.categoryName AS category, 
s.price, 
-- ✅ הנתונים מגיעים מטבלת orders דרך LEFT JOIN
IFNULL(sd.sold_last_30_days, 0) as bought
FROM shoes s 
JOIN categoryshoes c ON s.categoryId = c.categoryId 
LEFT JOIN SalesData sd ON s.shoesId = sd.shoesId
WHERE s.price IS NOT NULL
-- 🛑 סינון המלאי: בחר רק את המוצרים במבצע (shoppingBasket = 1)
AND s.shoppingBasket = 1 
`;
    const rawData = await dal_js_1.default.execute(sql);
    const analyzedData = analyzeShoePerformance(rawData.map((item) => ({
        Shoe_ID: item.shoesId,
        Category: item.category,
        Selling_Price: Number(item.price),
        Total_Sold_Units: Number(item.bought),
        price: Number(item.price),
        bought: Number(item.bought),
        title: item.title, // הוספת title
    })));
    const alerts = [];
    // בניית מפת המצליחנים (Top Seller) לכל קטגוריה
    const categoryPerformanceMap = {};
    for (const item of analyzedData) {
        if (!categoryPerformanceMap[item.Category] ||
            item.Total_Sold_Units >
                categoryPerformanceMap[item.Category].Total_Sold_Units) {
            categoryPerformanceMap[item.Category] = {
                ID: item.Shoe_ID,
                Total_Sold_Units: item.Total_Sold_Units,
                Selling_Price: item.Selling_Price,
            };
        }
    }
    for (const item of analyzedData) {
        const topSeller = categoryPerformanceMap[item.Category];
        let recommendation = "";
        let severity = "warning";
        // 1. המקרה של מוצר מצליח (לא Lagging)
        if (!item.IsLagging && item.Total_Sold_Units > 0) {
            severity = "info";
            recommendation = `🎉 SUCCESS: Performing well in the sale. Total Sold: ${item.Total_Sold_Units}. Keep promoting!`;
        }
        // 2. המקרה של מוצר "Lagging" (סומן כחלש ע"י AI)
        else if (item.IsLagging) {
            if (topSeller && topSeller.ID === item.Shoe_ID) {
                // המקרה הנדיר: ה-Top Seller הוא גם ה-Lagging (כשל קטגוריאלי)
                severity = "warning";
                recommendation = `⚠️ LAG-ALERT: This is the best-selling shoe in its category (within the sale), but was flagged by AI as 'Lagging' due to low price/sales ratio. Action: Re-evaluate category sale effectiveness.`;
            }
            else if (topSeller) {
                // לוגיקה רגילה להשוואה מול מתחרה
                if (topSeller.Total_Sold_Units === 0) {
                    recommendation = `🔍 REVIEW: Category is weak overall. Total Sold: ${item.Total_Sold_Units}.`;
                }
                else if (topSeller.Selling_Price > item.Selling_Price) {
                    severity = "critical";
                    recommendation = `🔥 CRITICAL: BIQUSH (DEMAND) ISSUE! Competitor (ID: ${topSeller.ID}) sold well despite being more expensive (${topSeller.Selling_Price} vs ${item.Selling_Price}). Action: STOP PRODUCTION / CHECK QUALITY.`;
                }
                else if (topSeller.Selling_Price < item.Selling_Price) {
                    severity = "warning";
                    recommendation = `💡 LOW DISCOUNT: Competitor (ID: ${topSeller.ID}) is cheaper (${topSeller.Selling_Price} vs ${item.Selling_Price}). Action: DEEPER DISCOUNT (30%+).`;
                }
                else {
                    severity = "warning";
                    recommendation = `🔍 REVIEW: Price is similar to top seller. Check inventory age / reviews for underlying issues.`;
                }
            }
            else {
                // אם אין Top Seller
                severity = "warning";
                recommendation = `⚠️ WARNING: No category comparison data. Total Sold: ${item.Total_Sold_Units}. Needs manual review.`;
            }
        }
        // 3. המקרה של מוצר שעדיין לא קיבל המלצה (מכירות 0 ואין Lagging)
        else if (item.Total_Sold_Units === 0) {
            severity = "warning";
            recommendation = `🔍 REVIEW: Total Sold: ${item.Total_Sold_Units}. Not flagged by K-Means, but sales are zero. Check for technical issues or visibility.`;
        }
        // 4. ברירת מחדל (אם המוצר לא Lagging ומכר 0, הוא נכנס לסעיף 3, אבל אם הוא לא Lagging ומכר > 0 הוא נכנס לסעיף 1. אם הוא Lagging הוא נכנס לסעיף 2)
        else {
            severity = "info";
            recommendation = `🎉 SUCCESS: Performing well in the sale. Total Sold: ${item.Total_Sold_Units}. Keep promoting!`;
        }
        alerts.push({
            shoesId: item.Shoe_ID,
            title: item.title,
            category: item.Category,
            currentPrice: item.Selling_Price,
            totalSold: item.Total_Sold_Units,
            severity: severity,
            recommendation: recommendation,
        });
    }
    alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1));
    return alerts;
}
