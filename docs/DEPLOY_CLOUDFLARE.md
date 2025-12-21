# Cloudflare Deployment Guide

This guide covers deploying the complete Nebria platform to Cloudflare infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                   │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │ Cloudflare     │         │  API Gateway     │           │
│  │ Pages          │────────▶│  Worker          │           │
│  │ (Frontend)     │         │  (/api/*)        │           │
│  └────────────────┘         └──────────────────┘           │
│                                      │                       │
└──────────────────────────────────────┼───────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────┐
                    │  Cloudflare Containers       │
                    │                               │
                    │  ┌────────────────────────┐  │
                    │  │  Backend API           │  │
                    │  │  (Node/Express)        │  │
                    │  └────────────────────────┘  │
                    │                               │
                    │  ┌────────────────────────┐  │
                    │  │  Background Worker     │  │
                    │  │  (BullMQ)              │  │
                    │  └────────────────────────┘  │
                    └──────────────────────────────┘
                              │            │
              ┌───────────────┴──────┬─────┴──────────┐
              ▼                      ▼                 ▼
    ┌─────────────────┐   ┌──────────────┐  ┌─────────────────┐
    │ Cloudflare R2   │   │ Upstash      │  │ Neon/Supabase   │
    │ (Media Storage) │   │ Redis        │  │ (PostgreSQL)    │
    └─────────────────┘   └──────────────┘  └─────────────────┘
```

## Prerequisites

- Cloudflare account with Workers/Pages enabled
- GitHub repository access
- Wrangler CLI: `npm install -g wrangler`
- Docker installed (for local testing)
- Accounts for:
  - Neon or Supabase (PostgreSQL)
  - Upstash (Redis)

## Step-by-Step Deployment

### 1. Set Up External Services

#### PostgreSQL (Neon)

1. Create account at https://neon.tech
2. Create a new project: "nebria-production"
3. Get connection string:
   ```
   postgres://user:password@ep-xxx.region.aws.neon.tech/nebria?sslmode=require
   ```
4. Run database schema:
   ```bash
   psql <connection-string> < backend/schema.sql
   ```

#### Redis (Upstash)

1. Create account at https://upstash.com
2. Create Redis database: "nebria-production"
3. Get Redis URL:
   ```
   rediss://default:password@region.upstash.io:6379
   ```

#### R2 Storage

1. In Cloudflare Dashboard → R2
2. Create bucket: "nebria-media"
3. Create R2 API token:
   - Go to R2 → Manage R2 API Tokens
   - Create token with "Object Read & Write" permissions
   - Save Access Key ID and Secret Access Key
4. Optional: Set up custom domain for public access

### 2. Deploy Frontend (Cloudflare Pages)

#### Via Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project" → "Connect to Git"
3. Select repository: `russsalesmanager-rgb/nebriamasterbuild`
4. Configure build:
   - **Production branch**: `main`
   - **Build command**: (leave empty)
   - **Build output directory**: `/frontend`
   - **Root directory**: `/`
5. Set environment variables:
   ```
   API_BASE_URL=/api
   WS_URL=wss://api.nebria.app
   ```
6. Click "Save and Deploy"

#### Via CLI

```bash
cd frontend
npx wrangler pages deploy . \
  --project-name=nebria-frontend \
  --branch=main
```

### 3. Deploy API Gateway Worker

```bash
cd infra/cloudflare/worker-gateway

# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put BACKEND_URL
# Enter: https://backend.nebria.app (or your container URL)

wrangler secret put CORS_ORIGIN
# Enter: https://nebria.app

# Deploy
wrangler deploy
```

### 4. Deploy Backend Container

**Note**: As of 2024, Cloudflare Containers are in beta. This section assumes they're available. If not, use alternative hosting like:
- Fly.io
- Railway
- Google Cloud Run
- AWS ECS/Fargate

#### Using Cloudflare Containers (when available)

```bash
# Build and push Docker image
docker build -t nebria-backend:latest ./backend
docker tag nebria-backend:latest registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-backend:latest
docker push registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-backend:latest

# Deploy with wrangler
cd infra/cloudflare
wrangler deploy --config wrangler-backend.toml

# Set secrets
wrangler secret put DB_NAME --config wrangler-backend.toml
wrangler secret put DB_USER --config wrangler-backend.toml
wrangler secret put DB_PASS --config wrangler-backend.toml
wrangler secret put DB_HOST --config wrangler-backend.toml
wrangler secret put JWT_SECRET --config wrangler-backend.toml
wrangler secret put REFRESH_SECRET --config wrangler-backend.toml
wrangler secret put REDIS_URL --config wrangler-backend.toml
wrangler secret put R2_ACCESS_KEY_ID --config wrangler-backend.toml
wrangler secret put R2_SECRET_ACCESS_KEY --config wrangler-backend.toml
wrangler secret put R2_BUCKET --config wrangler-backend.toml
wrangler secret put R2_ENDPOINT --config wrangler-backend.toml
```

#### Alternative: Deploy to Fly.io

```bash
cd backend

# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Create app
flyctl launch --name nebria-backend --region ord

# Set secrets
flyctl secrets set \
  DB_NAME=nebria \
  DB_USER=postgres \
  DB_PASS=your_password \
  DB_HOST=your_neon_host \
  JWT_SECRET=your_jwt_secret \
  REFRESH_SECRET=your_refresh_secret \
  REDIS_URL=your_upstash_url \
  R2_ACCESS_KEY_ID=your_r2_key \
  R2_SECRET_ACCESS_KEY=your_r2_secret \
  R2_BUCKET=nebria-media \
  R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com

# Deploy
flyctl deploy

# Get URL
flyctl info
```

### 5. Deploy Background Worker

```bash
cd infra/cloudflare
wrangler deploy --config wrangler-worker.toml

# Set secrets (same as backend)
wrangler secret put DB_NAME --config wrangler-worker.toml
wrangler secret put DB_USER --config wrangler-worker.toml
wrangler secret put DB_PASS --config wrangler-worker.toml
wrangler secret put DB_HOST --config wrangler-worker.toml
wrangler secret put REDIS_URL --config wrangler-worker.toml
```

### 6. Configure DNS

1. Go to Cloudflare Dashboard → DNS
2. Add records:

```
Type    Name        Content                          Proxy
CNAME   @           nebria-frontend.pages.dev        ✓
CNAME   www         nebria-frontend.pages.dev        ✓
CNAME   api         nebria-api-gateway.workers.dev   ✓
```

### 7. Verify Deployment

```bash
# Test frontend
curl https://nebria.app

# Test API health
curl https://api.nebria.app/health

# Test authentication
curl -X POST https://api.nebria.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST https://api.nebria.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Environment Variables Reference

### Frontend (Pages)
- `API_BASE_URL`: API endpoint (e.g., `/api` or `https://api.nebria.app/api`)
- `WS_URL`: WebSocket endpoint (e.g., `wss://api.nebria.app`)

### Backend (Container)
- `NODE_ENV`: `production`
- `PORT`: `3000`
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL username
- `DB_PASS`: PostgreSQL password
- `DB_HOST`: PostgreSQL host (Neon/Supabase)
- `DB_PORT`: `5432`
- `JWT_SECRET`: Secret for JWT signing
- `REFRESH_SECRET`: Secret for refresh tokens
- `REDIS_URL`: Upstash Redis connection URL
- `R2_ACCESS_KEY_ID`: Cloudflare R2 access key
- `R2_SECRET_ACCESS_KEY`: Cloudflare R2 secret key
- `R2_BUCKET`: R2 bucket name
- `R2_ENDPOINT`: R2 endpoint URL
- `R2_ACCOUNT_ID`: Cloudflare account ID
- `CORS_ORIGIN`: Allowed CORS origins

### Worker (Container)
- `NODE_ENV`: `production`
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL username
- `DB_PASS`: PostgreSQL password
- `DB_HOST`: PostgreSQL host
- `REDIS_URL`: Upstash Redis connection URL

### API Gateway (Worker)
- `BACKEND_URL`: Backend container URL
- `CORS_ORIGIN`: Allowed CORS origins

## Monitoring & Logs

### Cloudflare Dashboard
- Pages: Dashboard → Pages → nebria-frontend → Logs
- Workers: Dashboard → Workers → nebria-api-gateway → Logs
- R2: Dashboard → R2 → nebria-media → Metrics

### Application Logs
```bash
# Backend logs (if on Fly.io)
flyctl logs

# Worker logs
wrangler tail nebria-api-gateway
```

## Scaling

### Horizontal Scaling
- **Frontend**: Auto-scales via Cloudflare edge network
- **API Gateway**: Auto-scales via Cloudflare Workers
- **Backend**: Scale container instances (platform-dependent)
- **Worker**: Scale worker instances

### Database Scaling
- Neon: Auto-scales, supports read replicas
- Supabase: Manual scaling via dashboard

### Redis Scaling
- Upstash: Auto-scales, pay-per-request

## Costs Estimate (Monthly)

- **Cloudflare Pages**: Free (or $20/month for Pro features)
- **Cloudflare Workers**: Free tier + ~$5-20/month
- **Cloudflare R2**: $0.015/GB storage + $0.36/million requests
- **Neon PostgreSQL**: Free tier or $19+/month
- **Upstash Redis**: Free tier or $10+/month
- **Total**: ~$35-70/month for small to medium traffic

## Troubleshooting

### Frontend not loading
1. Check Pages deployment status
2. Verify DNS records
3. Check browser console for errors

### API errors
1. Check Worker logs: `wrangler tail nebria-api-gateway`
2. Verify backend is running
3. Check CORS configuration
4. Verify environment variables

### Database connection issues
1. Verify connection string
2. Check IP allowlist (if any)
3. Verify SSL/TLS settings
4. Test connection locally

### R2 upload failures
1. Verify R2 credentials
2. Check bucket permissions
3. Verify CORS policy on bucket

## Security Checklist

- [ ] All secrets stored securely (not in code)
- [ ] HTTPS enforced on all domains
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] JWT secrets are strong and unique
- [ ] Database has strong password
- [ ] R2 bucket has appropriate access controls
- [ ] Owner account created with strong password
- [ ] Audit logging enabled
- [ ] Content moderation configured

## Backup & Recovery

### Database Backups
- Neon: Automatic daily backups
- Supabase: Automatic backups with point-in-time recovery

### R2 Backups
```bash
# Backup R2 bucket
aws s3 sync s3://nebria-media s3://nebria-media-backup \
  --endpoint-url https://ACCOUNT_ID.r2.cloudflarestorage.com
```

## Rollback Procedure

### Frontend
```bash
# Rollback to previous deployment
cd frontend
wrangler pages deployment list --project-name=nebria-frontend
wrangler pages deployment rollback <deployment-id> --project-name=nebria-frontend
```

### Backend
```bash
# Deploy previous version
docker pull registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-backend:previous
wrangler deploy --config wrangler-backend.toml
```

## Support

- Cloudflare Docs: https://developers.cloudflare.com
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://docs.upstash.com
- GitHub Issues: https://github.com/russsalesmanager-rgb/nebriamasterbuild/issues
