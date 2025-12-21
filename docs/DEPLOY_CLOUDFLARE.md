# Cloudflare Deployment Guide

This guide covers deploying Nebria to Cloudflare's infrastructure for production use.

## Architecture Overview

Nebria on Cloudflare uses:

- **Cloudflare Pages**: Static frontend hosting
- **Cloudflare Workers**: Edge gateway/reverse proxy
- **Cloudflare Containers**: Backend API and worker services
- **Cloudflare R2**: S3-compatible object storage for media
- **Neon/Supabase**: Managed PostgreSQL database
- **Upstash Redis**: Managed Redis for caching and queues

## Prerequisites

- Cloudflare account (Pro plan recommended for Containers)
- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare API token with appropriate permissions
- Neon or Supabase account for PostgreSQL
- Upstash account for Redis

## Step-by-Step Deployment

### 1. Setup External Services

#### PostgreSQL (Neon)

1. Create a Neon project at https://neon.tech
2. Create a database named `nebria`
3. Copy the connection string
4. Run the schema:
   ```bash
   psql "postgresql://..." < backend/schema.sql
   ```

#### Redis (Upstash)

1. Create a Redis database at https://upstash.com
2. Copy the Redis URL

#### Cloudflare R2

1. In Cloudflare dashboard, navigate to R2
2. Create a bucket named `nebria-media`
3. Create API tokens for R2 access
4. Note your account ID

### 2. Configure Environment Variables

Create a `.env.production` file with production values:

```env
PORT=3000
NODE_ENV=production

# Database (from Neon)
DB_HOST=your-project.neon.tech
DB_NAME=nebria
DB_USER=your_user
DB_PASS=your_secure_password
DB_PORT=5432
DB_SSL=true

# JWT (Generate strong random strings!)
JWT_SECRET=your_production_jwt_secret_at_least_32_chars
REFRESH_SECRET=your_production_refresh_secret_at_least_32_chars

# Redis (from Upstash)
REDIS_URL=rediss://default:password@your-redis.upstash.io:6379

# Cloudflare R2
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_BUCKET=nebria-media
S3_ACCESS_KEY_ID=your_r2_access_key
S3_SECRET_ACCESS_KEY=your_r2_secret_key
S3_REGION=auto

# CORS (will be your Pages URL)
CORS_ORIGIN=https://nebria.pages.dev

# Security
HELMET_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Deploy Frontend (Cloudflare Pages)

```bash
# Build and deploy frontend
cd frontend

# Create Pages project
npx wrangler pages project create nebria-frontend

# Deploy
npx wrangler pages deploy . --project-name nebria-frontend
```

Your frontend will be available at `https://nebria-frontend.pages.dev`

### 4. Deploy Backend API Container

#### Create Dockerfile (already exists in backend/)

#### Build and Push

```bash
cd backend

# Login to Cloudflare
wrangler login

# Create container registry
# (This is done via Cloudflare dashboard under Workers & Pages > Containers)

# Build for production
docker build -t nebria-api .

# Tag for Cloudflare
docker tag nebria-api registry.cloudflare.com/your-account-id/nebria-api

# Push to Cloudflare
docker push registry.cloudflare.com/your-account-id/nebria-api

# Deploy container
wrangler containers deploy nebria-api \
  --account-id YOUR_ACCOUNT_ID \
  --env production
```

#### Configure Container Environment

In Cloudflare dashboard:
1. Navigate to Workers & Pages > Containers
2. Select `nebria-api`
3. Add all environment variables from `.env.production`
4. Set scaling: min 1, max 10 instances

### 5. Deploy Worker Container

Same process as API, but for the worker:

```bash
docker build -t nebria-worker -f Dockerfile.worker .
docker tag nebria-worker registry.cloudflare.com/your-account-id/nebria-worker
docker push registry.cloudflare.com/your-account-id/nebria-worker
wrangler containers deploy nebria-worker --account-id YOUR_ACCOUNT_ID --env production
```

Note: You'll need to create `Dockerfile.worker`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY src ./src
CMD ["node", "src/workers/index.js"]
```

### 6. Deploy Edge Gateway Worker

Create `infra/cloudflare/worker-gateway/index.js`:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route API requests to container backend
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/api')) {
      const backendUrl = `${env.BACKEND_ORIGIN}${url.pathname}${url.search}`;
      
      return fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
    
    // Serve frontend from Pages
    return env.ASSETS.fetch(request);
  }
};
```

Create `infra/cloudflare/worker-gateway/wrangler.toml`:

```toml
name = "nebria-gateway"
main = "index.js"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "nebria.com/*", zone_name = "nebria.com" }
]

[env.production.vars]
BACKEND_ORIGIN = "https://nebria-api.your-account.workers.dev"

[[env.production.bindings]]
type = "service"
name = "ASSETS"
service = "nebria-frontend"
environment = "production"
```

Deploy:

```bash
cd infra/cloudflare/worker-gateway
wrangler deploy
```

### 7. Configure Custom Domain

1. Add your domain to Cloudflare
2. In Pages project, add custom domain
3. Update CORS_ORIGIN in backend environment to your domain
4. Update worker routes to use your domain

### 8. Initialize Production Database

```bash
# Run migrations
curl -X POST https://your-api-url/api/admin/migrate \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Or use psql directly
psql "postgresql://..." < backend/schema.sql

# Run seed script
node backend/src/scripts/seed.js
```

### 9. Verify Deployment

```bash
# Check API health
curl https://your-domain.com/api/health

# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@nebria.com","password":"ChangeThisPassword123!"}'
```

## Required GitHub Secrets

For CI/CD automation, add these secrets to your GitHub repository:

```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_PAGES_PROJECT=nebria-frontend
DB_CONNECTION_STRING=postgresql://...
REDIS_URL=rediss://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
JWT_SECRET=...
REFRESH_SECRET=...
```

## Monitoring and Maintenance

### View Logs

```bash
# Worker logs
wrangler tail nebria-gateway

# Container logs
wrangler containers logs nebria-api
```

### Scaling

Containers auto-scale based on load. Configure in Cloudflare dashboard:
- Minimum instances: 1-2 for production
- Maximum instances: 10-100 depending on load
- CPU: 1-4 vCPUs per instance
- Memory: 512MB-2GB per instance

### Database Backups

Configure automated backups in Neon/Supabase dashboard.

Manual backup:
```bash
pg_dump "postgresql://..." > backup-$(date +%Y%m%d).sql
```

### Monitoring

Set up Cloudflare Analytics and alerts:
- API error rates
- Container response times
- R2 storage usage
- Database connection pool

## Costs Estimate

Monthly costs for moderate traffic (~100K requests/day):

- Cloudflare Pages: Free (included in Workers plan)
- Cloudflare Workers: $5/month (paid plan)
- Cloudflare Containers: ~$50-200/month (based on usage)
- Cloudflare R2: ~$5/month (10GB storage + bandwidth)
- Neon PostgreSQL: Free tier or $19/month
- Upstash Redis: Free tier or $10/month

**Total: ~$70-250/month** depending on traffic and resources

## Rollback

If deployment fails:

```bash
# Rollback Pages
wrangler pages deployment list --project-name nebria-frontend
wrangler pages deployment rollback <deployment-id>

# Rollback Worker
wrangler rollback nebria-gateway

# Rollback Container (redeploy previous version)
docker pull registry.cloudflare.com/your-account-id/nebria-api:previous
wrangler containers deploy nebria-api --version previous
```

## Security Checklist

- [ ] Change default admin passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS only
- [ ] Configure CSP headers
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configure database SSL
- [ ] Use least-privilege API tokens
- [ ] Enable audit logging
- [ ] Set up backup automation

## Next Steps

- Configure CDN caching rules
- Set up monitoring dashboards
- Configure auto-scaling policies
- Set up CI/CD pipelines
- Review and optimize database queries
- Configure media CDN settings

## Support

- Cloudflare Docs: https://developers.cloudflare.com
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://docs.upstash.com
