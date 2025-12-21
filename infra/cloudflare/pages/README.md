# Nebria Cloudflare Pages Configuration

## Project Setup

1. **Create Pages Project**:
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect to GitHub repository: `russsalesmanager-rgb/nebriamasterbuild`
   - Select branch: `main` (or your production branch)

2. **Build Configuration**:
   ```
   Build command: (leave empty - static site)
   Build output directory: /frontend
   Root directory: /
   ```

3. **Environment Variables**:
   
   **Production**:
   ```
   API_BASE_URL=/api
   WS_URL=wss://api.nebria.app
   ```
   
   **Preview**:
   ```
   API_BASE_URL=https://staging-api.nebria.app/api
   WS_URL=wss://staging-api.nebria.app
   ```

## Custom Domain

1. Add custom domain: `nebria.app`
2. Configure DNS:
   - Type: CNAME
   - Name: @
   - Value: `<your-pages-project>.pages.dev`

## Redirects & Headers

Create `frontend/_redirects`:
```
/api/*  https://api.nebria.app/api/:splat  200
```

Create `frontend/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/*
  Access-Control-Allow-Origin: https://nebria.app
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Allow-Credentials: true
```

## Deployment

Cloudflare Pages automatically deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview deployments
- Pull requests → Preview deployments

Manual deployment:
```bash
cd frontend
npx wrangler pages deploy . --project-name=nebria-frontend
```

## Pages Functions (Optional)

If you need edge functions, create `frontend/functions/api/[...path].js`:

```javascript
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Proxy to backend
  const backendUrl = `${env.BACKEND_URL}${url.pathname}${url.search}`;
  return fetch(backendUrl, request);
}
```
