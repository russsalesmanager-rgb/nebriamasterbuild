# Nebria Architecture

This document describes the technical architecture of the Nebria platform.

## System Overview

Nebria is a monolithic frontend with microservices backend architecture designed for scalability and maintainability.

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge                        │
│  ┌──────────────┐     ┌──────────────┐    ┌─────────────┐  │
│  │ Pages (CDN)  │────▶│ Worker       │───▶│ Containers  │  │
│  │ Frontend     │     │ Gateway      │    │ API/Worker  │  │
│  └──────────────┘     └──────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │    External Services           │
              │  ┌──────────┐  ┌───────────┐   │
              │  │PostgreSQL│  │   Redis   │   │
              │  │  (Neon)  │  │ (Upstash) │   │
              │  └──────────┘  └───────────┘   │
              │  ┌──────────┐                  │
              │  │    R2    │                  │
              │  │ Storage  │                  │
              │  └──────────┘                  │
              └────────────────────────────────┘
```

## Components

### Frontend (Cloudflare Pages)

**Technology**: Static HTML/CSS/JavaScript

The frontend is a self-contained single-page application built with vanilla JavaScript. It includes:

- **index.html**: Main application UI with all zones
- **app.js**: API client for backend communication
- **Zones**:
  - Core Feed: Reverse chronological timeline
  - You-Zone: Video platform
  - Pix-Zone: Image gallery
  - Pin-Zone: Collections/boards
  - Thread-Zone: Discussion forums
  - X-Zone: Trending signals
  - AI-Zone: AI interactions
  - Admin-Zone: Platform management
  - VR-Zone: Virtual reality

**Features**:
- JWT authentication with auto-refresh
- Real-time updates via WebSocket
- Zone-based navigation
- Responsive design
- Theme customization

### Edge Gateway (Cloudflare Worker)

**Technology**: Cloudflare Workers (JavaScript)

The gateway worker acts as a reverse proxy and handles:

- **Request Routing**: Routes `/api/*` to backend containers
- **CORS**: Adds CORS headers for cross-origin requests
- **Load Balancing**: Distributes traffic across container instances
- **WebSocket Proxying**: Forwards WebSocket connections
- **Static Asset Serving**: Serves frontend from Pages

**Benefits**:
- Global edge presence
- Low latency
- DDoS protection
- Automatic scaling

### Backend API (Cloudflare Containers)

**Technology**: Node.js, Express, Sequelize

The API server handles all business logic:

**Middleware Stack**:
1. Helmet (Security headers)
2. CORS (Cross-origin resource sharing)
3. Rate Limiting (DDoS protection)
4. Body Parser (JSON/URL-encoded)
5. Auth Middleware (JWT validation)
6. Error Handler (Standardized errors)

**Routes**:
- `/api/auth`: Authentication (login, register, refresh)
- `/api/posts`: Post management
- `/api/comments`: Comment management
- `/api/files`: File upload/download
- `/api/notifications`: Notification system
- `/api/users`: User profiles
- `/api/admin`: Admin operations
- `/api/ai`: AI integrations
- `/api/vr`: VR features
- `/api/tokens`: Token economy
- `/api/messages`: Direct messaging

**Security**:
- JWT authentication with refresh tokens
- bcrypt password hashing
- Role-based access control (RBAC)
- Input validation (express-validator)
- Rate limiting
- Helmet security headers
- Audit logging

### Background Worker (Cloudflare Containers)

**Technology**: Node.js, BullMQ

The worker processes asynchronous jobs:

**Job Types**:
- Video transcoding
- Image processing/optimization
- Notification dispatch
- Email sending
- Analytics aggregation
- Content moderation queue

**Features**:
- Configurable concurrency
- Job retry logic
- Dead letter queue
- Job prioritization

### Database (PostgreSQL)

**Technology**: PostgreSQL 15 (Neon/Supabase)

**Schema**:
- `users`: User accounts and profiles
- `roles`: Role definitions (OWNER, ADMIN, MODERATOR, etc.)
- `posts`: All content posts
- `comments`: Nested comments
- `reactions`: Likes, loves, etc.
- `files`: File metadata
- `videos`: Video-specific metadata
- `boards`: Pinterest-like collections
- `board_items`: Items in boards
- `tokens`: Token economy data
- `wallets`: User token balances
- `transactions`: Token transfers
- `chats`: Chat rooms
- `chat_participants`: Chat memberships
- `messages`: Chat messages
- `notifications`: User notifications
- `audit_logs`: Admin action logs

**Indexes**:
- `posts.created_at` (for chronological feeds)
- `posts.user_id` (for user posts)
- `posts.zone_key` (for zone filtering)
- `comments.post_id` (for comment lookup)
- `notifications.user_id` (for user notifications)

### Cache (Redis)

**Technology**: Redis 7 (Upstash)

**Usage**:
- Session storage
- Job queues (BullMQ)
- Real-time pub/sub
- Rate limiting counters
- Cache layer for frequent queries

### Storage (Cloudflare R2)

**Technology**: S3-compatible object storage

**Content Types**:
- Profile avatars
- Post images
- Videos (before/after transcoding)
- Documents
- Board items

**Features**:
- Public read access via CDN
- Presigned upload URLs
- Automatic image optimization
- CDN integration

## Data Flow

### Post Creation Flow

```
1. User submits post → Frontend (app.js)
2. POST /api/posts with JWT → Gateway Worker
3. Worker routes to → Backend API Container
4. API validates JWT → Auth Middleware
5. API creates post → PostgreSQL
6. API emits event → WebSocket (Socket.io)
7. API queues job → Redis (BullMQ)
8. API returns response → Frontend
9. Worker processes → Image optimization/notifications
10. Frontend updates → Real-time via WebSocket
```

### Authentication Flow

```
1. User enters credentials → Frontend
2. POST /api/auth/login → Gateway → API
3. API validates password → bcrypt
4. API generates tokens → JWT
5. API returns tokens → Frontend
6. Frontend stores tokens → localStorage
7. Frontend makes requests → Authorization: Bearer <token>
8. API validates token → JWT middleware
9. Token expires (15m) → Frontend auto-refresh
10. POST /api/auth/refresh → New access token
```

## Scaling Strategy

### Horizontal Scaling

- **API Containers**: Auto-scale 1-100 instances based on load
- **Worker Containers**: Scale 1-20 instances
- **Database**: Connection pooling (max 100 connections)
- **Redis**: Cluster mode for high availability

### Vertical Scaling

- **Containers**: 1-4 vCPUs, 512MB-2GB RAM per instance
- **Database**: Scale compute/storage independently
- **Redis**: Scale memory as needed

### Caching Strategy

1. **Edge Caching**: Static assets via Cloudflare CDN
2. **API Caching**: Redis for frequent queries (user profiles, etc.)
3. **Database Caching**: PostgreSQL query cache
4. **Browser Caching**: localStorage for user data

## Security Architecture

### Defense in Depth

1. **Edge Protection**: Cloudflare DDoS protection, WAF
2. **Application Security**: Helmet, CORS, input validation
3. **Authentication**: JWT with short expiry, refresh tokens
4. **Authorization**: RBAC with role hierarchy
5. **Data Security**: bcrypt passwords, encrypted connections
6. **Audit Logging**: All sensitive actions logged

### Compliance

- **GDPR**: User data export/deletion endpoints
- **Content Moderation**: Instant deletion for illegal content
- **Audit Trail**: Immutable logs for admin actions

## Monitoring and Observability

### Metrics

- Request rate, latency, error rate
- Container CPU/memory usage
- Database query performance
- Redis hit/miss ratio
- Job queue length and processing time

### Logging

- Structured JSON logs
- Log levels: error, warn, info, debug
- Centralized log aggregation
- Search and filtering

### Alerts

- API error rate > 5%
- Database connection pool exhaustion
- Job queue backup > 1000 jobs
- Container health check failures

## Deployment Pipeline

```
1. Developer pushes code → GitHub
2. GitHub Actions triggered → CI pipeline
3. Run tests → PostgreSQL + Redis services
4. Build containers → Docker
5. Push to registry → Cloudflare Registry
6. Deploy containers → Cloudflare Containers
7. Deploy frontend → Cloudflare Pages
8. Deploy gateway → Cloudflare Workers
9. Health checks → Verify deployment
10. Rollback if needed → Previous version
```

## Technology Choices

### Why Node.js/Express?

- Fast development velocity
- Large ecosystem (npm)
- Great WebSocket support
- Easy containerization

### Why Cloudflare?

- Global edge network
- Integrated services (Pages, Workers, Containers, R2)
- DDoS protection included
- Competitive pricing

### Why PostgreSQL?

- ACID compliance
- JSON support for flexible schemas
- Full-text search
- Mature ecosystem

### Why Redis?

- Fast in-memory operations
- Pub/sub for real-time features
- BullMQ job queue support
- Persistence options

## Future Enhancements

- **GraphQL API**: For more flexible queries
- **Mobile Apps**: React Native or Flutter
- **AI Features**: Content moderation, recommendations
- **Video Transcoding**: FFmpeg or cloud service
- **Analytics Dashboard**: Real-time metrics
- **Multi-region**: Deploy to multiple regions for lower latency
