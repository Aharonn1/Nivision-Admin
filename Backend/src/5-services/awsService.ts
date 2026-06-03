import { CloudWatchClient, GetMetricStatisticsCommand, Statistic } from "@aws-sdk/client-cloudwatch";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const cwClient = new CloudWatchClient({ region: "eu-north-1" });
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
            console.error("CPU Error (non-critical):", error);
            return 0;
        }
    }

    public async getInstanceStatus(instanceId: string): Promise<string> {
        try {
            const command = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
            const response = await ec2Client.send(command);
            return response.Reservations?.[0].Instances?.[0].State?.Name || "unknown";
        } catch (error) {
            console.error("Status Error (non-critical):", error);
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
            console.error("Network Error (non-critical):", error);
            return 0;
        }
    }

    // פונקציה חסינה שלא מפילה את המערכת
    public async getSystemIntelligence(): Promise<any> {
        const instanceId = "i-03a459ea9a19bd36a";
        
        // הרצה סדרתית מבודדת למניעת קריסות
        const cpu = await this.getCpuUsage(instanceId);
        const network = await this.getNetworkUsage(instanceId);
        const status = await this.getInstanceStatus(instanceId);

        return {
            cpu: cpu.toFixed(2),
            status: status,
            network: (network / 1024 / 1024).toFixed(2),
            totalCost: "$0.00",
            breakdown: []
        };
    }
}

export const awsService = new AwsService();