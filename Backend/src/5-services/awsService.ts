import { CloudWatchClient, GetMetricStatisticsCommand, Statistic } from "@aws-sdk/client-cloudwatch";
import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";

const cwClient = new CloudWatchClient({ region: "eu-north-1" });
const ceClient = new CostExplorerClient({ region: "us-east-1" }); // Billing תמיד ב-us-east-1

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

            if (response.Datapoints && response.Datapoints.length > 0) {
                return response.Datapoints[response.Datapoints.length - 1].Average || 0;
            }
            return 0;
        } catch (error) {
            console.error("Error fetching CPU from AWS:", error);
            throw new Error("Could not fetch metrics from AWS");
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
            
            return { 
                total: `$${parseFloat(total).toFixed(2)}`, 
                services: response.ResultsByTime?.[0].Groups || [] 
            };
        } catch (error) {
            console.error("Billing Error:", error);
            return { total: "$0.00", services: [] };
        }
    }
public async getSystemIntelligence(): Promise<any> {
    // נתונים מזויפים לצורך בדיקה בלבד
    return {
        cpu: "1.20",
        totalCost: "$15.42",
        breakdown: [
            { Keys: ["EC2"], Metrics: { UnblendedCost: { Amount: "10.00" } } },
            { Keys: ["RDS"], Metrics: { UnblendedCost: { Amount: "5.42" } } }
        ],
        status: "Healthy"
    };
}
}

export const awsService = new AwsService();