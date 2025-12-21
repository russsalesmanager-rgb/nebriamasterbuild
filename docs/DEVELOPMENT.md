# Nebria Local Development Guide

This guide covers everything you need to know to run Nebria locally for development.

## Prerequisites

- **Docker Desktop** (or Docker + Docker Compose)
- **Node.js 18+** (optional, for running without Docker)
- **Git**

## Quick Start with Docker

The easiest way to run Nebria locally is with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/russsalesmanager-rgb/nebriamasterbuild.git
cd nebriamasterbuild

# Start all services
docker compose up --build
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- MinIO S3-compatible storage (ports 9000, 9001)
- Backend API (port 3000)
- Background worker
- Frontend server (port 8080)

Access the application at:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/docs
- **MinIO Console**: http://localhost:9001

## First-Time Setup

### 1. Initialize the Database

The database will be automatically initialized with the schema on first run.

### 2. Seed Initial Data

Create owner and admin accounts:

```bash
docker compose exec api npm run seed
```

This creates:
- **Owner**: owner@nebria.com / ChangeThisPassword123!
- **Admin**: admin@nebria.com / AdminPassword123!

**⚠️ IMPORTANT: Change these passwords in production!**

### 3. Verify Everything Works

```bash
# Check API health
curl http://localhost:3000/api/health

# Should return: {"ok":true,"status":"healthy","timestamp":"..."}
```

## Running Without Docker

If you prefer to run services locally without Docker:

### 1. Install PostgreSQL and Redis

```bash
# macOS with Homebrew
brew install postgresql@15 redis

# Start services
brew services start postgresql@15
brew services start redis
```

### 2. Setup Database

```bash
# Create database
createdb nebria

# Run schema
psql nebria < backend/schema.sql
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your local database credentials
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Run Migrations and Seeds

```bash
npm run migrate
npm run seed
```

### 6. Start Backend

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

### 7. Start Worker

In a separate terminal:

```bash
cd backend
npm run worker
```

### 8. Start Frontend

In another terminal:

```bash
cd frontend
npx http-server -p 8080
```

## Development Workflow

### Making Code Changes

The Docker Compose setup includes volume mounts, so code changes are reflected immediately:

- **Backend**: Changes auto-reload with nodemon
- **Frontend**: Refresh browser to see changes

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f worker
docker compose logs -f postgres
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v
```

### Rebuilding Containers

After changing dependencies or Dockerfile:

```bash
docker compose up --build
```

## Database Management

### Run Migrations

```bash
docker compose exec api npm run migrate
```

### Access PostgreSQL CLI

```bash
docker compose exec postgres psql -U nebria -d nebria
```

### Backup Database

```bash
docker compose exec postgres pg_dump -U nebria nebria > backup.sql
```

### Restore Database

```bash
docker compose exec -T postgres psql -U nebria nebria < backup.sql
```

## Testing

### Run Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Run Linter

```bash
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5432, 6379, or 8080 are in use:

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Errors

```bash
# Restart postgres
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### "Cannot connect to Docker daemon"

```bash
# Make sure Docker Desktop is running
# Or start Docker service on Linux:
sudo systemctl start docker
```

### Module Not Found Errors

```bash
# Rebuild containers
docker compose down
docker compose up --build
```

## Environment Variables

See `backend/.env.example` for all available environment variables.

Key variables for local development:

```env
PORT=3000
NODE_ENV=development
DB_HOST=postgres
DB_NAME=nebria
DB_USER=nebria
DB_PASS=nebria
JWT_SECRET=dev_jwt_secret_min_32_characters_long
REFRESH_SECRET=dev_refresh_secret_min_32_characters_long
REDIS_URL=redis://redis:6379
CORS_ORIGIN=http://localhost:8080
```

## API Documentation

Interactive API documentation is available at http://localhost:3000/api/docs when the backend is running.

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Read [API.md](API.md) for detailed API documentation
- Read [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md) for production deployment

## Getting Help

- Check the logs: `docker compose logs -f`
- Open an issue on GitHub
- Review the API documentation at `/api/docs`
