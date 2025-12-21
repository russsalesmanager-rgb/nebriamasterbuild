# Local Development Guide

This guide will help you set up and run Nebria locally for development.

## Prerequisites

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) - optional, for development without Docker
- **Git** for version control

## Quick Start (Recommended)

The easiest way to run Nebria locally is with Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/russsalesmanager-rgb/nebriamasterbuild.git
cd nebriamasterbuild

# 2. Start all services
docker-compose up

# That's it! The services will start:
# - PostgreSQL on localhost:5432
# - Redis on localhost:6379
# - Backend API on http://localhost:3000
# - Background Worker (running)
# - Frontend on http://localhost:8080
```

Open your browser to http://localhost:8080 to see the Nebria frontend.

## First-Time Setup

### 1. Database Initialization

The database schema is automatically created when the backend starts (via Sequelize's `sync()`).

### 2. Seed Initial Data

Create the owner account and initial roles:

```bash
# If using Docker:
docker-compose exec backend npm run seed

# If running locally:
cd backend
npm run seed
```

**Default Owner Credentials**:
- Email: `owner@nebria.local`
- Password: `SecurePassword123!`
- ⚠️ **Change this password immediately after first login!**

You can customize the owner credentials with environment variables:
```bash
OWNER_EMAIL=admin@example.com \
OWNER_PASSWORD=YourSecurePassword \
OWNER_USERNAME=admin \
docker-compose exec backend npm run seed
```

### 3. Test the Setup

**Backend Health Check**:
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}
```

**Login as Owner**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@nebria.local","password":"SecurePassword123!"}'
```

You should receive an access token and refresh token.

**Create a Test Post**:
```bash
# Replace <TOKEN> with the accessToken from login
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "content": "Hello from Nebria!",
    "type": "TEXT",
    "zoneKey": "home"
  }'
```

**Get Feed**:
```bash
curl http://localhost:3000/api/posts
```

### 4. Access the Frontend

Open http://localhost:8080 in your browser.

The frontend will automatically connect to the backend at http://localhost:3000.

## Manual Setup (Without Docker)

If you prefer to run services manually:

### 1. Install PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# Create database
createdb nebria
createuser -s nebria
```

### 2. Install Redis

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env  # or your favorite editor

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start backend
npm run dev
```

The backend will start on http://localhost:3000

### 4. Start Background Worker

In a new terminal:
```bash
cd backend
npm run worker
```

### 5. Serve Frontend

In another terminal:
```bash
cd frontend

# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js
npx http-server -p 8080

# Option 3: PHP
php -S localhost:8080
```

The frontend will be available at http://localhost:8080

## Development Workflow

### Making Backend Changes

1. Edit files in `backend/src/`
2. If using `npm run dev`, nodemon will auto-restart
3. If using Docker, rebuild: `docker-compose up --build backend`

### Making Frontend Changes

1. Edit files in `frontend/`
2. Refresh browser (no build step required)
3. For JavaScript changes, hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Database Schema Changes

1. Edit model files in `backend/src/models/`
2. Restart backend to sync schema:
   ```bash
   docker-compose restart backend
   # or
   npm run migrate
   ```

### Adding New Dependencies

Backend:
```bash
cd backend
npm install <package-name>

# If using Docker, rebuild:
docker-compose up --build backend
```

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U nebria -d nebria

# Run SQL query
docker-compose exec postgres psql -U nebria -d nebria -c "SELECT * FROM users;"

# Backup database
docker-compose exec postgres pg_dump -U nebria nebria > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nebria -d nebria < backup.sql
```

### Redis Access

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# Check keys
docker-compose exec redis redis-cli KEYS '*'

# Flush all data (be careful!)
docker-compose exec redis redis-cli FLUSHALL
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Start fresh
docker-compose up

# Re-seed database
docker-compose exec backend npm run seed
```

## Testing

### Manual API Testing

Use the provided examples above, or use tools like:
- **Postman**: Import the collection from `docs/nebria.postman_collection.json` (create this if needed)
- **Insomnia**: REST client for API testing
- **curl**: Command-line testing (examples throughout this guide)

### Load Testing

```bash
# Install Apache Bench
# macOS: comes with macOS
# Ubuntu: sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test with POST (save data to file first)
ab -n 100 -c 5 -p post.json -T application/json http://localhost:3000/api/posts
```

## Troubleshooting

### Backend won't start

**Error: "Port 3000 already in use"**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Error: "Cannot connect to PostgreSQL"**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**Error: "Cannot connect to Redis"**
```bash
# Check if Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

### Frontend issues

**API calls fail with CORS errors**
- Check backend CORS configuration in `.env`
- Verify `CORS_ORIGIN` includes `http://localhost:8080`

**Blank page or JavaScript errors**
- Check browser console for errors
- Verify all scripts are loading (check Network tab)
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

### Database issues

**Tables don't exist**
```bash
# Run migrations
docker-compose exec backend npm run migrate
```

**Need to reset database**
```bash
# Stop and remove volume
docker-compose down -v

# Start again (fresh database)
docker-compose up

# Re-seed
docker-compose exec backend npm run seed
```

### Performance issues

**Slow API responses**
- Check database connection pool size
- Check Redis connection
- Review backend logs for slow queries
- Use PostgreSQL `EXPLAIN ANALYZE` for query optimization

**High memory usage**
- Limit Docker memory: Add `mem_limit: 512m` to services in docker-compose.yml
- Check for memory leaks in backend code
- Monitor with `docker stats`

## Environment Variables

### Backend (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_NAME=nebria
DB_USER=nebria
DB_PASS=nebria
DB_HOST=localhost  # Use 'postgres' when running in Docker
DB_PORT=5432

# Authentication
JWT_SECRET=your_secret_here
REFRESH_SECRET=your_refresh_secret_here

# Redis
REDIS_URL=redis://localhost:6379  # Use 'redis://redis:6379' in Docker

# CORS
CORS_ORIGIN=http://localhost:8080,http://localhost:3000

# Storage (optional for local dev)
S3_ENDPOINT=http://localhost:9000  # Use MinIO for local S3 testing
S3_BUCKET=nebria-media
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

### Frontend (window.NEBRIA_CONFIG)

Automatically configured in `frontend/index.html`:
```javascript
window.NEBRIA_CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  WS_URL: 'http://localhost:3000'
};
```

## Development Tips

### Hot Reloading

- **Backend**: Use `npm run dev` for automatic restarts via nodemon
- **Frontend**: Changes take effect immediately (just refresh browser)

### Debugging

**Backend (Node.js)**:
```bash
# Run with debugger
node --inspect src/server.js

# In Chrome: chrome://inspect
```

**Frontend (Browser)**:
- Use Chrome DevTools (F12)
- Set breakpoints in JavaScript files
- Use `console.log()` liberally
- Check Network tab for API calls

### Code Style

```bash
# Install ESLint (optional)
cd backend
npm install --save-dev eslint
npx eslint src/

# Format code (optional)
npm install --save-dev prettier
npx prettier --write "src/**/*.js"
```

## Next Steps

Once your local environment is running:

1. **Create test users**: Register via frontend or API
2. **Create test content**: Posts, comments, media uploads
3. **Test zones**: Switch between different zones in the UI
4. **Test moderation**: Flag content, ban users (as admin/owner)
5. **Review logs**: Check backend/worker logs for issues
6. **Explore API**: Read `docs/API.md` for full endpoint documentation

## Getting Help

- **Documentation**: Check `docs/` folder for guides
- **Issues**: Open an issue on GitHub
- **Logs**: Always check logs first: `docker-compose logs`

---

Happy coding! 🚀
