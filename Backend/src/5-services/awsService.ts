import { CloudWatchClient, GetMetricStatisticsCommand, Statistic } from "@aws-sdk/client-cloudwatch";
import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import dotenv from "dotenv";

const costExplorerClient = new CostExplorerClient({ region: "us-east-1" });

dotenv.config();

const clientConfig = { 
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
};

const cwClient = new CloudWatchClient(clientConfig);
const ec2Client = new EC2Client(clientConfig);

class AwsService {
    private readonly host = "ip-172-31-25-222"; // ה-Host שראינו ב-list-metrics
    private readonly instanceId = "i-03a459ea9a19bd36a";

    public async getCpuUsage(): Promise<number> {
        // שימוש ב-cpu-total כדי לקבל ממוצע של כל הליבות
        const idle = await this.getMetric("CWAgent", "cpu_usage_idle", "Average", [
            { Name: "host", Value: this.host },
            { Name: "cpu", Value: "cpu-total" }
        ]);
        return 100 - idle;
    }

    public async getMemoryUsage(): Promise<number> {
        return this.getMetric("CWAgent", "mem_used_percent", "Average", [
            { Name: "host", Value: this.host }
        ]);
    }

    public async getDiskUsage(): Promise<number> {
        // שימוש ב-Dimensions המדויקים שנמצאו ב-list-metrics
        return this.getMetric("CWAgent", "disk_used_percent", "Average", [
            { Name: "host", Value: this.host },
            { Name: "path", Value: "/" },
            { Name: "device", Value: "nvme0n1p1" },
            { Name: "fstype", Value: "ext4" }
        ]);
    }

    public async getInstanceStatus(): Promise<string> {
        try {
            const response = await ec2Client.send(new DescribeInstancesCommand({ InstanceIds: [this.instanceId] }));
            return response.Reservations?.[0].Instances?.[0].State?.Name || "unknown";
        } catch (e) {
            return "error";
        }
    }

    public async getErrorCount(): Promise<number> {
    // משיכת מטריקה מתוך CloudWatch Logs (באמצעות Insights)
    // או ספירת לוגים ב-Namespace ייעודי
    return this.getMetric("Nivision/Logs", "ErrorCount", "Sum", [
        { Name: "ServiceName", Value: "nivision-backend" }
    ]);
    }

    // הוסף את אלו למחלקה:

    public async getNetworkUsage(): Promise<{ in: number, out: number }> {
    const netIn = await this.getMetric("CWAgent", "net_bytes_recv", "Sum", [
        { Name: "host", Value: this.host },
        { Name: "interface", Value: "eth0" }
    ]);
    const netOut = await this.getMetric("CWAgent", "net_bytes_sent", "Sum", [
        { Name: "host", Value: this.host },
        { Name: "interface", Value: "eth0" }
    ]);
    return { in: netIn / 1024 / 1024, out: netOut / 1024 / 1024 }; // המרה ל-MB
    }

    public async getSwapUsage(): Promise<number> {
    return this.getMetric("CWAgent", "swap_used_percent", "Average", [
        { Name: "host", Value: this.host }
    ]);
    }

    private async getMetric(namespace: string, metricName: string, stat: string, dimensions: any[]): Promise<number> {
        try {
            const response = await cwClient.send(new GetMetricStatisticsCommand({
                Namespace: namespace,
                MetricName: metricName,
                Dimensions: dimensions,
                StartTime: new Date(Date.now() - 600000),
                EndTime: new Date(),
                Period: 300,
                Statistics: [stat as Statistic],
            }));
            return response.Datapoints?.[0]?.Average || 0;
        } catch { return 0; }
    }

    // 1. עדכון ה-Promise.all בתוך getSystemIntelligence
    public async getSystemIntelligence(): Promise<any> {
    const [cpu, mem, disk, status, errorCount, net, swap] = await Promise.all([
        this.getCpuUsage(),
        this.getMemoryUsage(),
        this.getDiskUsage(),
        this.getInstanceStatus(),
        this.getErrorCount(),
        this.getNetworkUsage(),
        this.getSwapUsage()
    ]);

    return {
        timestamp: new Date().toISOString(),
        status,
        resources: {
            cpu: `${cpu.toFixed(2)}%`,
            memory: `${mem.toFixed(2)}%`,
            disk: `${disk.toFixed(2)}%`,
            errors: errorCount.toString(),
            netIn: `${net.in.toFixed(1)} MB`,
            netOut: `${net.out.toFixed(1)} MB`,
            swap: `${swap.toFixed(2)}%`
        }
    };
    }

  public async getMonthlyCostTrend(startDate?: string, endDate?: string) {
    // הגדרת ברירת מחדל: מתחילת החודש הנוכחי עד היום
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = now.toISOString().split('T')[0];

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    const command = new GetCostAndUsageCommand({
        TimePeriod: { 
            Start: start, 
            End: end 
        },
        // הגדרנו MONTHLY כדי לקבל סיכום חודשי גלובלי, 
        // או DAILY אם אתה רוצה לראות את התנודתיות היומית
        Granularity: "MONTHLY", 
        Metrics: ["UnblendedCost"],
        GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }]
    });

    try {
        const response = await costExplorerClient.send(command);
        
        // וודא שהתשובה מכילה נתונים לפני ההחזרה
        return response.ResultsByTime || [];
    } catch (error) {
        console.error("❌ Error fetching AWS cost data:", error);
        throw new Error("Failed to fetch AWS billing data");
    }
}
    
}

export const awsService = new AwsService();
