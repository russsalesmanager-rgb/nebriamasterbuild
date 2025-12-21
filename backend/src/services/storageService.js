/*
 * Storage service
 *
 * This module encapsulates logic for uploading and retrieving files from
 * an S3‑compatible storage backend.  In production you can use
 * Cloudflare R2, AWS S3 or any compatible object storage.  Configure
 * credentials via environment variables.
 */

const fs = require('fs');
// For demonstration only: we will not import AWS SDK to avoid bloating
// dependencies. In a real implementation you could require
// '@aws-sdk/client-s3' or 'aws-sdk' and configure credentials.

async function uploadFile(localPath, remoteKey) {
  // TODO: integrate with S3
  // Example using AWS SDK v3:
  // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  // const client = new S3Client({
  //   region: process.env.AWS_REGION,
  //   credentials: {
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  //   },
  //   endpoint: process.env.S3_ENDPOINT
  // });
  // const fileStream = fs.createReadStream(localPath);
  // await client.send(new PutObjectCommand({
  //   Bucket: process.env.S3_BUCKET,
  //   Key: remoteKey,
  //   Body: fileStream
  // }));
  // return { url: `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${remoteKey}` };
  return { url: `/uploads/${remoteKey}` };
}

module.exports = { uploadFile };