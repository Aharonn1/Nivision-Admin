import { CloudWatchClient, GetMetricStatisticsCommand, Statistic } from "@aws-sdk/client-cloudwatch";
import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const cwClient = new CloudWatchClient({ region: "eu-north-1" });
const ceClient = new CostExplorerClient({ region: "us-east-1" });
const ec2Client = new EC2Client({ region: "eu-north-1" });

class AwsService {

    public async getCpuUsage(instanceId: string): Promise<number> {
        try {
            const params = {
                Namespace: "AWS/EC2",
                MetricName: "CPUUtilization",
                Dimensions: [{ Name: "InstanceId", Value: instanceId }],
                StartTime: new Date(Date.now() - 600000),
                EndTime: new Date(),
                Period: 300,
                Statistics: [Statistic.Average],
            };
            const command = new GetMetricStatisticsCommand(params);
            const response = await cwClient.send(command);
            return response.Datapoints?.[response.Datapoints.length - 1]?.Average || 0;
        } catch (error) {
            console.error("CPU Error:", error);
            return 0;
        }
    }

    public async getInstanceStatus(instanceId: string): Promise<string> {
        try {
            const command = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
            const response = await ec2Client.send(command);
            return response.Reservations?.[0].Instances?.[0].State?.Name || "unknown";
        } catch (error) {
            return "error";
        }
    }

    public async getNetworkUsage(instanceId: string): Promise<number> {
        try {
            const params = {
                Namespace: "AWS/EC2",
                MetricName: "NetworkIn",
                Dimensions: [{ Name: "InstanceId", Value: instanceId }],
                StartTime: new Date(Date.now() - 600000),
                EndTime: new Date(),
                Period: 300,
                Statistics: [Statistic.Average],
            };
            const command = new GetMetricStatisticsCommand(params);
            const response = await cwClient.send(command);
            return response.Datapoints?.[response.Datapoints.length - 1]?.Average || 0;
        } catch (error) {
            return 0;
        }
    }

    private async getBillingDetails(): Promise<{ total: string, services: any }> {
        try {
            const command = new GetCostAndUsageCommand({
                TimePeriod: { 
                    Start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                    End: new Date().toISOString().split('T')[0] 
                },
                Granularity: "MONTHLY",
                Metrics: ["UnblendedCost"],
                GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }]
            });
            const response = await ceClient.send(command);
            const total = response.ResultsByTime?.[0].Total?.UnblendedCost?.Amount || "0";
            return { total: `$${parseFloat(total).toFixed(2)}`, services: response.ResultsByTime?.[0].Groups || [] };
        } catch (error) {
            return { total: "$0.00", services: [] };
        }
    }

    public async getSystemIntelligence(): Promise<any> {
    const instanceId = "i-03a459ea9a19bd36a";
    
    // נריץ כל פונקציה בנפרד כדי שאם אחת תיכשל, האחרות ימשיכו לעבוד
    const cpu = await this.getCpuUsage(instanceId);
    const network = await this.getNetworkUsage(instanceId);
    const status = await this.getInstanceStatus(instanceId);
    
    // ננסה להביא תשלומים, אבל אם זה נכשל - נחזיר ערך ריק ולא ניתן לזה להפיל את הכל
    let costs = { total: "$0.00", services: [] };
    try {
        costs = await this.getBillingDetails();
    } catch (e) {
        console.log("Billing skipped due to permissions");
    }

    return {
        cpu: cpu.toFixed(2),
        status: status,
        network: (network / 1024 / 1024).toFixed(2),
        totalCost: costs.total,
        breakdown: costs.services
    };
}
}

export const awsService = new AwsService();