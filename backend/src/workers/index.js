/**
 * Background worker entry point
 * 
 * This worker processes background jobs using BullMQ and Redis.
 * Jobs include:
 * - Video transcoding
 * - Image processing
 * - Notification dispatch
 * - Email sending
 * - Analytics aggregation
 */

require('dotenv').config();
const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Job processors
const processNotification = async (job) => {
  console.log(`Processing notification job ${job.id}:`, job.data);
  // TODO: Send notification via push, email, or WebSocket
  return { success: true };
};

const processVideoTranscode = async (job) => {
  console.log(`Processing video transcode job ${job.id}:`, job.data);
  // TODO: Transcode video using FFmpeg or cloud service
  return { success: true };
};

const processImageResize = async (job) => {
  console.log(`Processing image resize job ${job.id}:`, job.data);
  // TODO: Resize/optimize image
  return { success: true };
};

const processEmail = async (job) => {
  console.log(`Processing email job ${job.id}:`, job.data);
  // TODO: Send email via SMTP or email service
  return { success: true };
};

// Create workers
const notificationWorker = new Worker('notifications', processNotification, {
  connection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5
});

const videoWorker = new Worker('video-processing', processVideoTranscode, {
  connection,
  concurrency: 2 // Lower concurrency for CPU-intensive tasks
});

const imageWorker = new Worker('image-processing', processImageResize, {
  connection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5
});

const emailWorker = new Worker('emails', processEmail, {
  connection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5
});

// Worker event handlers
[notificationWorker, videoWorker, imageWorker, emailWorker].forEach(worker => {
  worker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed in queue ${job.queueName}`);
  });
  
  worker.on('failed', (job, err) => {
    console.error(`✗ Job ${job.id} failed in queue ${job.queueName}:`, err.message);
  });
  
  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });
});

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚙️  Nebria Background Worker                            ║
║                                                           ║
║   Workers running:                                        ║
║   - Notifications                                         ║
║   - Video Processing                                      ║
║   - Image Processing                                      ║
║   - Email Sending                                         ║
║                                                           ║
║   Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}            ║
║   Concurrency: ${process.env.WORKER_CONCURRENCY || 5}                                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers gracefully...');
  await Promise.all([
    notificationWorker.close(),
    videoWorker.close(),
    imageWorker.close(),
    emailWorker.close()
  ]);
  connection.quit();
  console.log('Workers closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing workers gracefully...');
  await Promise.all([
    notificationWorker.close(),
    videoWorker.close(),
    imageWorker.close(),
    emailWorker.close()
  ]);
  connection.quit();
  console.log('Workers closed');
  process.exit(0);
});
