import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minio',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minio123',
    },
});
const bucket = process.env.S3_BUCKET || 'uploads';
export async function uploadToS3(key, body, contentType) {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    const endpoint = process.env.S3_ENDPOINT?.replace('http://', '').replace('https://', '') || 'localhost:9000';
    return `${process.env.S3_ENDPOINT}/${bucket}/${encodeURIComponent(key)}`.replace(/\/$/, '');
}
