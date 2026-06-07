import { CloudWatchClient, GetMetricStatisticsCommand } from "@aws-sdk/client-cloudwatch";

export class AWSCloudWatchService {
    private client = new CloudWatchClient({ region: "eu-north-1" });

    public async getAwsCpuUsage() {
        const command = new GetMetricStatisticsCommand({
            Namespace: "AWS/EC2",
            MetricName: "CPUUtilization",
            Dimensions: [{ Name: "InstanceId", Value: "i-03a459ea9a19bd36a" }],
            StartTime: new Date(Date.now() - 300000),
            EndTime: new Date(),
            Period: 60,
            Statistics: ["Average"]
        });

        const response = await this.client.send(command);
        return response.Datapoints && response.Datapoints.length > 0 
               ? response.Datapoints[0].Average 
               : 0;
    }
}
