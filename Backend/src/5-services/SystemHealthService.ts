import { exec } from 'child_process';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);

export class SystemHealthService {
    // שמירת היסטוריה בזיכרון (מתאפס בריסטארט, מושלם ל-15 דקות האחרונות)
    private static latencyHistory: number[] = Array.from({ length: 20 }, () => 40 + Math.random() * 10); // מתחיל עם 20 נקודות של 40-50ms
    private static errorCountHistory: number[] = []; // זה התיקון לשגיאה שלך!
 
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
