require('dotenv').config();
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const { RDSClient, DescribeDBInstancesCommand } = require('@aws-sdk/client-rds');
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');

const ec2Client = new EC2Client({ region: process.env.AWS_REGION });
const rdsClient = new RDSClient({ region: process.env.AWS_REGION });

async function getAWSStats() {
    try {
        const ec2Command = new DescribeInstancesCommand({});
        const ec2Data = await ec2Client.send(ec2Command);

        const ec2Instances = ec2Data.Reservations?.flatMap(r =>
            r.Instances.map(instance => ({
                id: instance.InstanceId,
                name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed',
                type: instance.InstanceType,
                state: instance.State.Name,
                publicIp: instance.PublicIpAddress || 'None',
                privateIp: instance.PrivateIpAddress,
                launchTime: instance.LaunchTime,
                platform: instance.Platform || 'Linux'
            }))
        ) || [];

        const rdsCommand = new DescribeDBInstancesCommand({});
        const rdsData = await rdsClient.send(rdsCommand);

        const rdsInstances = rdsData.DBInstances?.map(db => ({
            id: db.DBInstanceIdentifier,
            name: db.DBName || 'No database name',
            engine: db.Engine,
            version: db.EngineVersion,
            instanceClass: db.DBInstanceClass,
            status: db.DBInstanceStatus,
            endpoint: db.Endpoint?.Address,
            port: db.Endpoint?.Port,
            storage: db.AllocatedStorage,
            multiAZ: db.MultiAZ,
            publicAccess: db.PubliclyAccessible,
            createdTime: db.InstanceCreateTime
        })) || [];

        return {
            ec2: {
                instances: ec2Instances,
                count: ec2Instances.length
            },
            rds: {
                instances: rdsInstances,
                count: rdsInstances.length
            },
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('AWS Stats Error:', error);
        throw error;
    }
}

module.exports = { getAWSStats };