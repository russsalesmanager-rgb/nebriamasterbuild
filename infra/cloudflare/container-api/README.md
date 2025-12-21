# Nebria API Container

This directory contains configuration for deploying the Nebria backend API as a Cloudflare Container.

## Build

```bash
# From repository root
docker build -t nebria-api -f backend/Dockerfile backend/

# Or from this directory
docker build -t nebria-api ../../backend/
```

## Test Locally

```bash
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=nebria \
  -e DB_USER=nebria \
  -e DB_PASS=nebria \
  -e JWT_SECRET=test_secret_min_32_chars \
  -e REFRESH_SECRET=test_refresh_secret_min_32_chars \
  nebria-api
```

## Deploy to Cloudflare

```bash
# Login
wrangler login

# Tag for Cloudflare registry
docker tag nebria-api registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-api:latest

# Push
docker push registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-api:latest

# Deploy
wrangler containers deploy nebria-api \
  --account-id YOUR_ACCOUNT_ID \
  --env production
```

## Environment Variables

Configure these in the Cloudflare dashboard under the container settings:

- PORT=3000
- NODE_ENV=production
- DB_HOST=your-postgres-host
- DB_NAME=nebria
- DB_USER=your_user
- DB_PASS=your_password
- DB_PORT=5432
- DB_SSL=true
- JWT_SECRET=your_jwt_secret
- REFRESH_SECRET=your_refresh_secret
- REDIS_URL=your_redis_url
- S3_ENDPOINT=your_r2_endpoint
- S3_BUCKET=nebria-media
- S3_ACCESS_KEY_ID=your_key
- S3_SECRET_ACCESS_KEY=your_secret
- CORS_ORIGIN=https://your-domain.com

## Scaling

Configure auto-scaling in Cloudflare dashboard:
- Min instances: 1-2
- Max instances: 10-50
- CPU: 1-2 vCPUs
- Memory: 512MB-1GB
