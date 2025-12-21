# Nebria API Documentation

This document provides detailed information about the Nebria REST API.

## Base URL

- Local: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Nebria uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "john",
      "email": "user@example.com",
      "role": "USER"
    }
  }
}
```

### Using the Token

Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to get a new one:

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Response Format

All API responses follow a standard format:

### Success Response

```json
{
  "ok": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error Response

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Endpoints

### Authentication

#### Register

```bash
POST /api/auth/register
```

Body:
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```bash
POST /api/auth/login
```

Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token

```bash
POST /api/auth/refresh
```

Body:
```json
{
  "refreshToken": "..."
}
```

#### Logout

```bash
POST /api/auth/logout
```

Body:
```json
{
  "refreshToken": "..."
}
```

### Posts

#### Get Feed

Get posts in reverse chronological order (strict).

```bash
GET /api/posts?zone_key=core-feed&limit=50&offset=0
```

Query Parameters:
- `zone_key` (optional): Filter by zone (e.g., 'you-zone', 'pix-zone', 'thread-zone')
- `limit` (optional, default: 50, max: 100): Number of posts
- `offset` (optional, default: 0): Pagination offset

Response:
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "Hello world!",
      "type": "TEXT",
      "zoneKey": "core-feed",
      "createdAt": "2024-01-01T00:00:00Z",
      "author": {
        "id": "uuid",
        "username": "john",
        "avatarUrl": "https://...",
        "isVerified": false
      },
      "comments": [],
      "reactions": []
    }
  ],
  "meta": {
    "limit": 50,
    "offset": 0,
    "count": 25,
    "zoneKey": "core-feed"
  }
}
```

#### Create Post

```bash
POST /api/posts
Authorization: Bearer <token>
```

Body:
```json
{
  "content": "My post content",
  "type": "TEXT",
  "zoneKey": "core-feed",
  "mediaId": "uuid (optional)",
  "parentId": "uuid (optional, for replies)"
}
```

#### Get Single Post

```bash
GET /api/posts/:id
```

#### Delete Post

```bash
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Comments

#### Get Comments for Post

```bash
GET /api/comments?postId=<uuid>
```

#### Create Comment

```bash
POST /api/comments
Authorization: Bearer <token>
```

Body:
```json
{
  "postId": "uuid",
  "content": "Great post!",
  "parentId": "uuid (optional, for nested replies)"
}
```

### Files

#### Upload File

```bash
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form Data:
- `file`: The file to upload

Response:
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "filename": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "url": "https://..."
  }
}
```

### Notifications

#### Get Notifications

```bash
GET /api/notifications
Authorization: Bearer <token>
```

#### Mark as Read

```bash
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Users

#### Get User Profile

```bash
GET /api/users/:id
```

#### Update Own Profile

```bash
PUT /api/users/me
Authorization: Bearer <token>
```

Body:
```json
{
  "bio": "New bio",
  "avatarUrl": "https://..."
}
```

### Admin (Requires Admin/Moderator Role)

#### Get All Users

```bash
GET /api/admin/users?page=1
Authorization: Bearer <token>
```

#### Ban User

```bash
POST /api/admin/users/:id/ban
Authorization: Bearer <token>
```

Body:
```json
{
  "reason": "Violation of terms"
}
```

#### Delete Post (Admin)

```bash
DELETE /api/admin/posts/:id
Authorization: Bearer <token>
```

Body:
```json
{
  "reason": "Illegal content"
}
```

## Rate Limiting

API requests are rate limited:
- Window: 15 minutes
- Limit: 100 requests per IP
- Response when exceeded: `429 Too Many Requests`

## Error Codes

Common error codes:

- `VALIDATION_ERROR`: Invalid input data
- `INVALID_CREDENTIALS`: Wrong email/password
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `EMAIL_EXISTS`: Email already registered
- `USERNAME_EXISTS`: Username already taken
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## WebSocket Events

Connect to WebSocket at: `ws://localhost:3000` (or wss:// for production)

### Client Events

```javascript
socket.emit('joinRoom', 'zone:core-feed');
socket.emit('leaveRoom', 'zone:core-feed');
```

### Server Events

```javascript
socket.on('newPost', (post) => {
  // Handle new post in real-time
});

socket.on('newNotification', (notification) => {
  // Handle new notification
});
```

## Interactive Documentation

Visit `/api/docs` for interactive Swagger/OpenAPI documentation when the server is running.
