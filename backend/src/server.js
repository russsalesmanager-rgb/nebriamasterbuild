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
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

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
if (process.env.HELMET_ENABLED !== 'false') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", process.env.CORS_ORIGIN || "*"]
      }
    }
  }));
}

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { ok: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nebria API',
      version: '0.1.0',
      description: 'API documentation for the Nebria social media super-platform',
      contact: {
        name: 'Nebria Platform',
        url: 'https://nebria.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

if (process.env.ENABLE_API_DOCS !== 'false') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    data: {
      name: 'Nebria API',
      version: '0.1.0',
      description: 'Social media super-platform API',
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        auth: '/api/auth',
        users: '/api/users',
        posts: '/api/posts',
        comments: '/api/comments',
        files: '/api/files',
        tokens: '/api/tokens',
        messages: '/api/messages',
        notifications: '/api/notifications',
        admin: '/api/admin',
        ai: '/api/ai',
        vr: '/api/vr'
      }
    }
  });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    ok: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Create HTTP server and attach WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // TODO: Implement JWT authentication from query/handshake
  // const token = socket.handshake.query.token || socket.handshake.auth.token;
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
  
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
  });
  
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
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Nebria Backend Server                                ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   API endpoint:      http://localhost:${PORT}/api          ║
║   API docs:          http://localhost:${PORT}/api/docs     ║
║   Health check:      http://localhost:${PORT}/api/health   ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    db.close().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});