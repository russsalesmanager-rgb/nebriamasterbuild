# Nebria - Universe of Social Platforms

**Nebria** is a comprehensive social media super-platform combining the best features of YouTube, Pinterest, Instagram, Reddit, and more into a single, unified experience. This repository contains the complete source code for both frontend and backend, ready for local development and Cloudflare deployment.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)
- PostgreSQL 15+ (if running without Docker)
- Redis (if running background workers)

### One-Command Local Setup

```bash
docker compose up --build
```

This will start:
- PostgreSQL database
- Redis cache
- Backend API server (port 3000)
- Worker service for background jobs
- Frontend static server (port 8080)

### Access the Application

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 📁 Repository Structure

```
nebriamasterbuild/
├── frontend/           # Nebria UI (massive single-page app)
│   ├── index.html     # Main HTML file (preserved exactly as designed)
│   └── app.js         # API client and frontend logic
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── server.js         # Entry point
│   │   ├── config/           # Database configuration
│   │   ├── middleware/       # Auth, validation, etc.
│   │   ├── models/           # Sequelize models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── workers/          # Background jobs
│   ├── migrations/           # Database migrations
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docs/              # Documentation and runbooks
│   ├── DEVELOPMENT.md        # Local development guide
│   ├── DEPLOY_CLOUDFLARE.md  # Cloudflare deployment guide
│   ├── API.md                # API documentation
│   └── ARCHITECTURE.md       # System architecture
├── infra/             # Infrastructure and deployment configs
│   └── cloudflare/
│       ├── worker-gateway/   # Edge gateway worker
│       ├── container-api/    # API container config
│       └── container-worker/ # Worker container config
├── .github/
│   └── workflows/     # CI/CD pipelines
├── docker-compose.yml # Local development orchestration
└── README.md         # This file
```

## 🛠️ Development

### Backend Development

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Development

The frontend is a self-contained HTML file. To serve it locally:

```bash
cd frontend
npx http-server -p 8080
```

### Database Migrations

```bash
cd backend
npm run migrate
npm run seed  # Creates owner/admin accounts
```

## 🔑 Key Features

### Non-Negotiables (Preserved)
- **Massive UI**: All zones and features preserved exactly as designed
- **Backend Compatibility**: All existing routes work without breaking changes
- **Strict Chronological Feeds**: `created_at DESC` only, no algorithmic ranking
- **Clickable URLs**: Allowed everywhere with safety controls
- **Illegal Content Policy**: Instant deletion + permanent ban
- **Owner Control**: Absolute control with audit logging

### Core Zones
- **Core Feed**: Reverse chronological timeline
- **You-Zone**: Video platform (YouTube-like)
- **Pix-Zone**: Image gallery (Instagram-like)
- **Pin-Zone**: Collections and boards (Pinterest-like)
- **Thread-Zone**: Discussion forums
- **X-Zone**: Trending signals hub
- **AI-Zone**: AI model interactions
- **Admin-Zone**: Platform management
- **VR-Zone**: Virtual reality lobby

## 🌐 Cloudflare Deployment

Nebria is designed to run on Cloudflare's edge infrastructure:

- **Frontend**: Cloudflare Pages
- **Backend API**: Cloudflare Containers
- **Worker**: Background job container
- **Gateway**: Cloudflare Worker (reverse proxy)
- **Database**: Managed PostgreSQL (Neon/Supabase)
- **Cache**: Upstash Redis
- **Storage**: Cloudflare R2

See [docs/DEPLOY_CLOUDFLARE.md](docs/DEPLOY_CLOUDFLARE.md) for detailed deployment instructions.

## 🔒 Security

- JWT-based authentication with refresh tokens
- bcrypt password hashing
- Role-based access control (OWNER, ADMIN, MODERATOR, VERIFIED_CREATOR, USER)
- Input validation on all endpoints
- Rate limiting
- Audit logging for sensitive actions
- CSP headers for XSS protection

## 📚 API Documentation

Interactive API documentation is available at `/api/docs` when running the backend.

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/posts` - Get feed (chronological)
- `POST /api/posts` - Create post
- `POST /api/files/upload` - Upload media
- `GET /api/notifications` - Get notifications
- `GET /api/admin/*` - Admin operations

## 🧪 Testing

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📝 Environment Variables

### Backend Required Variables

```env
PORT=3000
NODE_ENV=development

# Database
DB_NAME=nebria
DB_USER=nebria
DB_PASS=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
REFRESH_SECRET=your_refresh_secret_min_32_chars

# Storage (Cloudflare R2 / S3)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_BUCKET=nebria-media
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:8080
```

## 🤝 Contributing

This is a production-ready platform. When making changes:

1. Preserve all existing functionality
2. Add tests for new features
3. Update documentation
4. Run linters and tests before committing
5. Follow the existing code style

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- API Docs: http://localhost:3000/api/docs (when running)

---

Built with ❤️ for the Nebria community
