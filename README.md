# Nebria - Universe of Social Platforms

Nebria is a comprehensive social media super-platform combining multiple social experiences: video sharing (You-Zone), Pinterest-style boards (Pin-Zone), Instagram galleries (Pix-Zone), threaded discussions (Thread-Zone), trending signals (X-Zone), AI interactions (AI-Zone), VR experiences (VR-Zone), and powerful administration tools.

## 🏗️ Architecture

```
/frontend       → Nebria UI (HTML, CSS, JS)
/backend        → Node/Express API + WebSocket server
/infra          → Cloudflare deployment configurations
/docs           → Documentation and runbooks
docker-compose.yml → Local development orchestration
```

### Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no build step required)
- **Backend**: Node.js + Express + Sequelize ORM
- **Database**: PostgreSQL 15
- **Cache/Jobs**: Redis + BullMQ
- **Storage**: S3-compatible (Cloudflare R2 in production)
- **Real-time**: Socket.io WebSockets

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development without Docker)

### One-Command Start

```bash
# Start all services (API, worker, database, Redis, frontend)
docker-compose up

# Or run in background
docker-compose up -d
```

This will start:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Backend API on `http://localhost:3000`
- Background Worker (BullMQ)
- Frontend on `http://localhost:8080`

### Access the Application

1. **Frontend**: http://localhost:8080
2. **API Health Check**: http://localhost:3000/api/health
3. **API Base URL**: http://localhost:3000/api

### Initial Setup

1. **Database Migrations**: The backend automatically syncs the database schema on startup using Sequelize's `db.sync()`.

2. **Create Owner Account**:
```bash
# Connect to the backend container
docker-compose exec backend node -e "
const models = require('./src/models');
models.sequelize.sync().then(async () => {
  const user = await models.User.create({
    username: 'owner',
    email: 'owner@nebria.local',
    passwordHash: 'SecurePassword123!',
    roleId: 1
  });
  console.log('Owner created:', user.id);
  process.exit(0);
});
"
```

3. **Test Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@nebria.local","password":"SecurePassword123!"}'
```

## 📦 Manual Setup (Without Docker)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your local settings

# Ensure PostgreSQL is running
# Ensure Redis is running

# Start the API server
npm start

# In another terminal, start the worker
node src/worker.js
```

### Frontend

```bash
# Serve the frontend with any HTTP server
cd frontend
python3 -m http.server 8080
# or
npx http-server -p 8080
```

## 🔑 Environment Variables

See `backend/.env.example` for all configuration options. Key variables:

- `PORT`: API server port (default: 3000)
- `DB_*`: PostgreSQL connection settings
- `JWT_SECRET`, `REFRESH_SECRET`: Authentication secrets
- `REDIS_URL`: Redis connection URL
- `S3_*` / `R2_*`: Object storage configuration
- `CORS_ORIGIN`: Allowed CORS origins

## 🧪 Testing the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a Post (requires auth token)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "content": "Hello from Nebria!",
    "type": "TEXT",
    "zoneKey": "home"
  }'
```

### Get Feed for a Zone
```bash
# Home feed
curl http://localhost:3000/api/posts?zone_key=home

# You-Zone feed
curl http://localhost:3000/api/posts?zone_key=you

# X-Zone feed
curl http://localhost:3000/api/posts?zone_key=x
```

## 🏛️ Core Features

### Zones
Nebria organizes content into different "zones":
- `home`: Core chronological feed
- `you`: YouTube-like video network
- `pin`: Pinterest-style boards
- `pix`: Instagram-style gallery
- `thread`: Discussion forums
- `x`: Trending signals
- `vr`: Virtual reality lobby
- `ai`: AI chat and creativity

### Content Policies
- **Reverse Chronological**: All feeds are strictly ordered by `created_at DESC`
- **Clickable URLs**: URLs in content are allowed (with safety controls)
- **Illegal Content**: Instant delete + permanent ban (owner can override)
- **Owner Override**: Owner role can override any moderation action (logged in audit trail)

### API Response Format
All API responses follow a consistent format:

**Success**:
```json
{
  "ok": true,
  "data": { /* response data */ },
  "meta": { /* pagination, counts, etc. */ }
}
```

**Error**:
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": "Additional context"
  }
}
```

## 🛠️ Development Workflow

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f worker

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 📊 Database Schema

Key tables:
- `roles`: User roles (OWNER, ADMIN, MODERATOR, VERIFIED_CREATOR, USER)
- `users`: User accounts with authentication
- `posts`: All content (with zone_key, content flags)
- `comments`: Nested comments on posts
- `reactions`: Likes, loves, etc.
- `files`: Media metadata
- `videos`: Video-specific metadata
- `boards` & `board_items`: Pin-Zone collections
- `tokens`, `wallets`, `transactions`: $FREEDOM token economy
- `chats`, `messages`: Direct messaging
- `notifications`: Real-time notifications
- `audit_logs`: Immutable action logs

## 🚢 Deployment

See `/docs/DEPLOY_CLOUDFLARE.md` for production deployment to Cloudflare infrastructure:
- Frontend on Cloudflare Pages
- Backend on Cloudflare Workers + Containers
- Media on Cloudflare R2
- Database on Neon/Supabase (managed Postgres)
- Redis on Upstash

## 📚 Documentation

- [Cloudflare Deployment Guide](docs/DEPLOY_CLOUDFLARE.md)
- [Systems Map](docs/SYSTEMS_MAP.md)
- [API Documentation](docs/API.md)
- [Security Policies](docs/SECURITY.md)

## 🔐 Security

- JWT-based authentication with short-lived access tokens
- Refresh token rotation
- bcrypt password hashing
- Role-based access control (RBAC)
- Rate limiting on all API endpoints
- Helmet.js security headers
- Content Security Policy (CSP) configured for clickable URLs
- Audit logging for sensitive operations

## 🤝 Contributing

1. Make changes in a feature branch
2. Test locally with `docker-compose up`
3. Ensure all tests pass
4. Submit PR

## 📄 License

MIT

---

Built with ❤️ for the Nebria community
