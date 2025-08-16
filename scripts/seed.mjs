import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minio',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minio123',
  },
});

const bucket = process.env.S3_BUCKET || 'uploads';

try {
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Created bucket ${bucket}`);
} catch (e) {
  console.log(`Bucket ${bucket} exists or could not be created:`, e?.message || e);
}