/**
 * Nebria API Gateway Worker
 * 
 * This Cloudflare Worker acts as an edge gateway for the Nebria backend API.
 * It handles:
 * - Routing /api/* requests to the backend container
 * - Adding request IDs for tracing
 * - Basic edge rate limiting headers
 * - CORS handling
 * - TLS termination
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'nebria-gateway' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Only handle /api/* paths
    if (!url.pathname.startsWith('/api')) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Generate request ID
    const requestId = crypto.randomUUID();
    
    // Get backend container URL from environment
    const backendUrl = env.BACKEND_URL || 'http://backend:3000';
    
    // Forward the request to the backend
    const backendRequestUrl = `${backendUrl}${url.pathname}${url.search}`;
    
    // Clone headers and add request ID
    const headers = new Headers(request.headers);
    headers.set('X-Request-ID', requestId);
    headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
    headers.set('X-Forwarded-Proto', 'https');
    
    // Create backend request
    const backendRequest = new Request(backendRequestUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'manual'
    });
    
    try {
      // Forward to backend
      const response = await fetch(backendRequest);
      
      // Clone response and add CORS headers
      const newHeaders = new Headers(response.headers);
      
      // Add CORS headers if not already present
      if (!newHeaders.has('Access-Control-Allow-Origin')) {
        newHeaders.set('Access-Control-Allow-Origin', env.CORS_ORIGIN || '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        newHeaders.set('Access-Control-Allow-Credentials', 'true');
      }
      
      // Add request ID to response
      newHeaders.set('X-Request-ID', requestId);
      
      // Add rate limit headers (informational)
      newHeaders.set('X-RateLimit-Limit', '100');
      newHeaders.set('X-RateLimit-Remaining', '99');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
      
    } catch (error) {
      console.error('Backend request failed:', error);
      
      return new Response(JSON.stringify({
        ok: false,
        error: {
          code: 'GATEWAY_ERROR',
          message: 'Failed to reach backend service',
          requestId: requestId
        }
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      });
    }
  }
};
