/*
 * Storage service
 *
 * This module handles file uploads to S3-compatible storage (Cloudflare R2, AWS S3, etc.)
 * Configure via environment variables in .env file.
 */

const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 client
let s3Client = null;

function getS3Client() {
  if (!s3Client) {
    const endpoint = process.env.S3_ENDPOINT || process.env.R2_ENDPOINT;
    const region = process.env.S3_REGION || 'auto';
    
    s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY
      }
    });
  }
  return s3Client;
}

/**
 * Upload a file to S3/R2 storage
 * @param {string} localPath - Path to local file
 * @param {string} remoteKey - Remote object key/path
 * @returns {Promise<{url: string}>} - Public URL of uploaded file
 */
async function uploadFile(localPath, remoteKey) {
  const bucket = process.env.S3_BUCKET || process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  
  // Check if S3/R2 is configured
  if (!bucket) {
    console.warn('S3/R2 not configured. Falling back to local storage.');
    return { url: `/uploads/${remoteKey}` };
  }
  
  try {
    const client = getS3Client();
    const fileStream = fs.createReadStream(localPath);
    
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: remoteKey,
      Body: fileStream,
      ContentType: getMimeType(localPath)
    }));
    
    // Return public URL
    if (publicUrl) {
      return { url: `${publicUrl}/${remoteKey}` };
    } else {
      // Generate signed URL (valid for 1 hour)
      const url = await getSignedUrl(client, new PutObjectCommand({
        Bucket: bucket,
        Key: remoteKey
      }), { expiresIn: 3600 });
      return { url };
    }
  } catch (error) {
    console.error('S3/R2 upload failed:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Get MIME type from file path
 * @param {string} filePath 
 * @returns {string}
 */
function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'json': 'application/json'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = { uploadFile };