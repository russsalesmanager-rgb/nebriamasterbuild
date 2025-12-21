/*
 * Nebria backend entry point
 *
 * This file bootstraps the Express application, connects to the
 * PostgreSQL database using Sequelize, registers core middleware,
 * mounts API routes and initialises the real‑time WebSocket server.
 *
 * The application is designed to be modular. Each major domain
 * (auth, users, posts, comments, media, messaging, monetisation,
 * administration, AI services, VR and notifications) is organised
 * into its own router under src/routes. Middleware lives in
 * src/middleware and services in src/services.
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./config/db');
const { authMiddleware } = require('./middleware/auth');

// Import route definitions
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const fileRoutes = require('./routes/files');
const tokenRoutes = require('./routes/tokens');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const vrRoutes = require('./routes/vr');

// Create the Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { ok: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:8080'];
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vr', vrRoutes);

// Create HTTP server and attach WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // TODO: handle authentication with JWT token passed in query
  // socket.handshake.query.token
  // socket.on('joinRoom', (room) => socket.join(room));
  // socket.on('sendMessage', (data) => handle send message)
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible within routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000;

db.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Nebria backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
  });