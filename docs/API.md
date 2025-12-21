# Nebria API Documentation

Base URL: `https://api.nebria.app/api` (Production) or `http://localhost:3000/api` (Local)

All API responses follow a consistent format:

**Success Response:**
```json
{
  "ok": true,
  "data": { ... },
  "meta": { "count": 50, "offset": 0, "limit": 50 }
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional context"
  }
}
```

## Authentication

All authenticated endpoints require a JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes. Use the refresh token to get a new access token.

---

## Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string (min 3 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "roleId": 5
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_token"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## User Endpoints

### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "avatarUrl": "string",
    "bio": "string",
    "roleId": 5,
    "isVerified": false,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get User by ID
```http
GET /users/:id
```

### Update Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "bio": "string",
  "avatarUrl": "string"
}
```

### Follow User
```http
POST /users/:id/follow
Authorization: Bearer <token>
```

### Unfollow User
```http
DELETE /users/:id/follow
Authorization: Bearer <token>
```

### Block User
```http
POST /users/:id/block
Authorization: Bearer <token>
```

### Mute User
```http
POST /users/:id/mute
Authorization: Bearer <token>
```

---

## Post Endpoints

### Get Feed
```http
GET /posts?zone_key=home&limit=50&offset=0
```

**Query Parameters:**
- `zone_key` (optional): Filter by zone (home, you, pin, pix, thread, x, vr, ai)
- `limit` (optional, default: 50): Number of posts to return
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "string",
      "type": "TEXT|IMAGE|VIDEO|LINK|MULTIMEDIA",
      "mediaId": "uuid",
      "parentId": "uuid",
      "zoneKey": "home",
      "zoneType": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "author": {
        "id": "uuid",
        "username": "string"
      },
      "comments": [],
      "reactions": []
    }
  ],
  "meta": {
    "count": 50,
    "offset": 0,
    "limit": 50
  }
}
```

### Get Post by ID
```http
GET /posts/:id
```

### Create Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string (max 5000 chars)",
  "type": "TEXT|IMAGE|VIDEO|LINK|MULTIMEDIA",
  "mediaId": "uuid (optional)",
  "parentId": "uuid (optional)",
  "zoneKey": "home|you|pin|pix|thread|x|vr|ai",
  "zoneType": "string (optional)"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "string",
    "type": "TEXT",
    "zoneKey": "home",
    "createdAt": "timestamp",
    "author": {
      "id": "uuid",
      "username": "string"
    }
  }
}
```

### Delete Post
```http
DELETE /posts/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "message": "Post deleted"
  }
}
```

### Flag as Illegal Content
```http
POST /posts/:id/flag-illegal
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string"
}
```

**Note:** Only available to MODERATOR, ADMIN, and OWNER roles.

**Response:**
```json
{
  "ok": true,
  "data": {
    "message": "Content flagged as illegal and user banned",
    "postId": "uuid",
    "userId": "uuid"
  }
}
```

### Unban Post (Owner Override)
```http
POST /posts/:id/unban
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string"
}
```

**Note:** Only available to OWNER role. Action is logged in audit trail.

---

## Comment Endpoints

### Get Comments
```http
GET /posts/:postId/comments
```

### Create Comment
```http
POST /posts/:postId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string",
  "parentId": "uuid (optional)"
}
```

### Delete Comment
```http
DELETE /comments/:id
Authorization: Bearer <token>
```

---

## File/Media Endpoints

### Upload File
```http
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
zoneKey: string (optional)
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "filename": "string",
    "mimetype": "string",
    "size": 12345,
    "url": "string",
    "createdAt": "timestamp"
  }
}
```

### Get File Metadata
```http
GET /files/:id
```

### Delete File
```http
DELETE /files/:id
Authorization: Bearer <token>
```

---

## Notification Endpoints

### Get Notifications
```http
GET /notifications?limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional, default: 20): Number of notifications

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "like|comment|follow|mention|dm",
      "content": "string",
      "isRead": false,
      "createdAt": "timestamp"
    }
  ]
}
```

### Mark as Read
```http
POST /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
POST /notifications/read-all
Authorization: Bearer <token>
```

---

## Token/Wallet Endpoints

### Get Balance
```http
GET /tokens/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "balance": 1000,
    "currency": "FREEDOM"
  }
}
```

### Purchase Boost
```http
POST /tokens/boost
Authorization: Bearer <token>
Content-Type: application/json

{
  "postId": "uuid",
  "amount": 100
}
```

### Get Transactions
```http
GET /tokens/transactions?limit=50
Authorization: Bearer <token>
```

---

## Admin Endpoints

**Note:** All admin endpoints require ADMIN or OWNER role.

### Get Analytics
```http
GET /admin/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalUsers": 1000,
    "totalPosts": 5000,
    "activeUsers": 250,
    "postsToday": 150,
    "storageUsed": "1.2 GB"
  }
}
```

### List Users
```http
GET /admin/users?page=1&limit=50
Authorization: Bearer <token>
```

### Ban User
```http
POST /admin/users/:id/ban
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string"
}
```

### Unban User
```http
DELETE /admin/users/:id/ban
Authorization: Bearer <token>
```

---

## Search Endpoints

### Search
```http
GET /search?q=query&type=all
```

**Query Parameters:**
- `q`: Search query string
- `type` (optional): Filter by type (all, posts, users, hashtags)

---

## Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 5 minutes
- **Upload endpoints**: 10 requests per hour

Rate limit info is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## WebSocket Events

Connect to WebSocket: `wss://api.nebria.app?token=<access_token>`

### Events Received

**notification**
```json
{
  "type": "notification",
  "data": {
    "id": "uuid",
    "type": "like",
    "content": "User liked your post",
    "createdAt": "timestamp"
  }
}
```

**message**
```json
{
  "type": "message",
  "data": {
    "id": "uuid",
    "chatId": "uuid",
    "senderId": "uuid",
    "content": "string",
    "createdAt": "timestamp"
  }
}
```

---

## Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT`: Too many requests
- `GATEWAY_ERROR`: Backend service unavailable
- `FETCH_FAILED`: Failed to fetch data
- `CREATE_FAILED`: Failed to create resource
- `UPDATE_FAILED`: Failed to update resource
- `DELETE_FAILED`: Failed to delete resource

---

## Best Practices

1. **Always check the `ok` field** in responses
2. **Store tokens securely** (localStorage for web, secure storage for mobile)
3. **Implement token refresh** before access token expires
4. **Handle rate limits** gracefully with exponential backoff
5. **Validate input** on client side before sending to API
6. **Use WebSockets** for real-time features (notifications, chat)
7. **Implement retry logic** for network failures

---

For more information, see:
- [Local Development Guide](LOCAL_DEV.md)
- [Deployment Guide](DEPLOY_CLOUDFLARE.md)
- [Systems Map](SYSTEMS_MAP.md)
