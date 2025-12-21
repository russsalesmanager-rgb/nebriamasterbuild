# Nebria Frontend - Cloudflare Pages

This directory contains the Nebria frontend application.

## Local Development

```bash
npx http-server -p 8080
```

## Deploy to Cloudflare Pages

### Via Wrangler CLI

```bash
npx wrangler pages deploy . --project-name nebria-frontend
```

### Via Git Integration

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - Build command: (none - static files)
   - Build output directory: `/frontend`
   - Root directory: `frontend`

## Environment Variables

Set these in Cloudflare Pages settings:

- `API_URL`: URL of your backend API (e.g., `https://nebria.com/api`)

## Custom Domain

Configure in Cloudflare Pages dashboard after deployment.

## Notes

- The `index.html` file is a self-contained application
- `app.js` provides the API client for backend communication
- No build step required - pure HTML/CSS/JavaScript
