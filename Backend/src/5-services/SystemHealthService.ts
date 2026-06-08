import { exec } from 'child_process';
import util from 'util';
import os from 'os';
import { CloudWatchClient, GetMetricStatisticsCommand } from "@aws-sdk/client-cloudwatch";

const execPromise = util.promisify(exec);

export class SystemHealthService {
    // שמירת היסטוריה בזיכרון (מתאפס בריסטארט, מושלם ל-15 דקות האחרונות)
    private static latencyHistory: number[] = Array.from({ length: 20 }, () => 40 + Math.random() * 10); // מתחיל עם 20 נקודות של 40-50ms
    private static errorCountHistory: number[] = []; // זה התיקון לשגיאה שלך!
 private cloudWatch: CloudWatchClient;

    constructor() {
        // וודא שה-AWS Credentials שלך מוגדרים בסביבה (ENV)
        this.cloudWatch = new CloudWatchClient({ region: "eu-north-1" }); // שנה לאזור שלך
    }
    public getCpuLoad() {
        return os.loadavg(); // [1, 5, 15] דקות אחרונות
    }

    public getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // ב-MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            rss: Math.round(usage.rss / 1024 / 1024)
        };
    }

    public getLatencyDistribution(latencies: number[]) {
        const buckets = { '0-50': 0, '50-100': 0, '100+': 0 };
        latencies.forEach(l => {
            if (l < 50) buckets['0-50']++;
            else if (l < 100) buckets['50-100']++;
            else buckets['100+']++;
        });
        return buckets;
    }

    // מדד חדש ל-Network (תלוי ב-interface של השרת שלך)
    public async getNetworkTraffic() {
    // בשרת Linux ניתן לשלוף מ-/proc/net/dev או להשתמש ב-utility
    const { stdout } = await execPromise("cat /proc/net/dev | grep eth0 | awk '{print $2, $10}'");
    const [rx, tx] = stdout.split(' ');
    return { rx: parseInt(rx), tx: parseInt(tx) };
    }

    // מדד חדש לשגיאות לאורך זמן
    public getErrorHistory() {
    // כאן תוכל לשמור מערך של מונה שגיאות שמתאפס כל דקה
    return SystemHealthService.errorCountHistory; 
    }

    public async getReliabilityMetrics() {
        // 1. שליפת לוגים
        const recent_events = await this.getRecentSystemEvents();

        // 2. סימולציה של נתוני עומס
        const currentLatency = Math.floor(Math.random() * 50) + 20;
        SystemHealthService.latencyHistory.push(currentLatency);
        if (SystemHealthService.latencyHistory.length > 50) SystemHealthService.latencyHistory.shift();

        // 3. חישובים מתקדמים
        const p99 = this.calculateP99(SystemHealthService.latencyHistory);
        const trend = this.calculateTrend(SystemHealthService.latencyHistory);

        // 4. החזרת המידע המלא כולל ה-system_load שחסר לך
        return {
            p99_latency: p99,
            error_rate: 0.1,
            uptime_score: 99.9,
            recent_events,
            trend,
            history: SystemHealthService.latencyHistory,
            system_load: {
                cpu: this.getCpuLoad(), // מחזיר [1, 5, 15]
                memory: this.getMemoryUsage() // מחזיר {heapUsed, heapTotal, rss}
            }
        };
    }
    
    async getAwsResources() {
        try {
            // כאן אנחנו מבקשים נתונים מ-CloudWatch
            const cpuData = await this.getMetric("CPUUtilization", "AWS/EC2", "InstanceId", "i-0xxxxxxxxxxxxxx");
            
            // ניתן להוסיף כאן לוגיקה נוספת למשיכת Memory או Disk במידה והותקן CloudWatch Agent
            
            return {
                resources: {
                    cpu: cpuData || 0,
                    memory: 256, // במידה ואין Memory Metrics מוגדרים, נשאר קבוע
                    disk: 45,    // כנ"ל לגבי Disk
                    errors: 0,
                    netIn: 102,
                    netOut: 85,
                    swap: 5
                }
            };
        } catch (error) {
            console.error("Error fetching AWS metrics:", error);
            throw new Error("Failed to fetch infrastructure metrics");
        }
    }

private async getMetric(metricName: string, namespace: string, dimensionName: string, dimensionValue: string) {
        const command = new GetMetricStatisticsCommand({
            Namespace: namespace,
            MetricName: metricName,
            Dimensions: [{ Name: dimensionName, Value: dimensionValue }],
            StartTime: new Date(Date.now() - 600000), // 10 דקות אחרונות
            EndTime: new Date(),
            Period: 300,
            Statistics: ["Average"],
        });

        const response = await this.cloudWatch.send(command);
        const datapoints = response.Datapoints;
        
        if (datapoints && datapoints.length > 0) {
            return datapoints[datapoints.length - 1].Average;
        }
        return 0;
    }

    private calculateTrend(history: number[]): string {
        if (history.length < 2) return "stable";
        const last = history[history.length - 1];
        const prev = history[history.length - 2];
        return last > prev ? "up" : "down";
    }

    private async getRecentSystemEvents(): Promise<string[]> {
        try {
            const { stdout } = await execPromise('pm2 logs --lines 20 --nostream --raw | grep -E "ERROR|WARN" | tail -n 5');
            return stdout.split('\n').filter(line => line.trim() !== "");
        } catch (e) {
            return [];
        }
    }

    private calculateP99(latencies: number[]): number {
        if (latencies.length === 0) return 0;
        const sorted = [...latencies].sort((a, b) => a - b);
        const index = Math.floor(sorted.length * 0.99);
        return sorted[index];
    }
}
