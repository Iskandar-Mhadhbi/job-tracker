
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localstack:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true,
});

const BUCKET = 'job-tracker-cvs';

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const detail = event.detail || {};
  const { applicationId, oldStatus, newStatus, userId, timestamp } = detail;

  const notification = {
    applicationId,
    oldStatus,
    newStatus,
    userId,
    timestamp,
    processedAt: new Date().toISOString(),
    message: `Application ${applicationId} status changed from ${oldStatus} to ${newStatus}`,
  };

  const key = `notifications/${applicationId}-${Date.now()}.json`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(notification, null, 2),
      ContentType: 'application/json',
    }),
  );

  console.log(`Notification written to s3://${BUCKET}/${key}`);

  return { statusCode: 200, body: 'Notification processed' };
  
};
