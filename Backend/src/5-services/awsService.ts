import { 
    CloudWatchClient, 
    GetMetricStatisticsCommand, 
    Statistic // הוספתי את הייבוא הזה
} from "@aws-sdk/client-cloudwatch";

const cwClient = new CloudWatchClient({ region: "eu-north-1" });

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
                // שינוי כאן: שימוש ב-Enum של Statistic
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
}

export const awsService = new AwsService();