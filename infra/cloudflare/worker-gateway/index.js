/**
 * Nebria Edge Gateway Worker
 * 
 * This Cloudflare Worker acts as a reverse proxy and edge gateway for Nebria.
 * It routes API requests to backend containers and serves the frontend from Pages.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Add CORS headers for API requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Route API requests to container backend
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      try {
        const backendUrl = `${env.BACKEND_ORIGIN}${url.pathname}${url.search}`;
        
        const backendRequest = new Request(backendUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          redirect: 'follow'
        });

        const response = await fetch(backendRequest);
        
        // Clone response and add CORS headers
        const modifiedResponse = new Response(response.body, response);
        Object.keys(corsHeaders).forEach(key => {
          modifiedResponse.headers.set(key, corsHeaders[key]);
        });
        
        return modifiedResponse;
      } catch (error) {
        console.error('Backend proxy error:', error);
        return new Response(JSON.stringify({
          ok: false,
          error: {
            code: 'GATEWAY_ERROR',
            message: 'Backend service unavailable'
          }
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // For WebSocket connections
    if (request.headers.get('Upgrade') === 'websocket') {
      const backendUrl = `${env.BACKEND_ORIGIN}${url.pathname}${url.search}`;
      return fetch(backendUrl, request);
    }

    // Serve frontend from Pages
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Fallback
    return new Response('Not Found', { status: 404 });
  }
};
