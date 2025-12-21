# Nebria Worker Container

This directory contains configuration for deploying the Nebria background worker as a Cloudflare Container.

## Build

```bash
# From repository root
docker build -t nebria-worker -f infra/cloudflare/container-worker/Dockerfile backend/
```

## Test Locally

```bash
docker run \
  -e NODE_ENV=development \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=nebria \
  -e DB_USER=nebria \
  -e DB_PASS=nebria \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  nebria-worker
```

## Deploy to Cloudflare

```bash
# Tag for Cloudflare registry
docker tag nebria-worker registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-worker:latest

# Push
docker push registry.cloudflare.com/YOUR_ACCOUNT_ID/nebria-worker:latest

# Deploy
wrangler containers deploy nebria-worker \
  --account-id YOUR_ACCOUNT_ID \
  --env production
```

## Environment Variables

Same as the API container, configure in Cloudflare dashboard.

## Scaling

Workers should have:
- Min instances: 1
- Max instances: 5-10
- CPU: 1-2 vCPUs
- Memory: 512MB-1GB
