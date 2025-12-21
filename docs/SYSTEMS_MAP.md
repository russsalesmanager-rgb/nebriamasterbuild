# Nebria Systems Map

This document provides a comprehensive overview of the Nebria platform architecture, data flows, and system interactions.

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Mobile App  │  │   Desktop    │         │
│  │  (Browser)   │  │   (Future)   │  │   (Future)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────┴─────────────────────────────────────┐
│                         Edge Layer                               │
│  ┌──────────────────┐           ┌──────────────────────┐       │
│  │ Cloudflare Pages │           │   API Gateway        │       │
│  │   (Frontend)     │◀─────────▶│   (Worker)           │       │
│  └──────────────────┘           └──────────────────────┘       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                      Application Layer                           │
│  ┌────────────────────────────┐  ┌────────────────────────┐    │
│  │   Backend API              │  │  Background Worker     │    │
│  │   (Express/Node.js)        │  │  (BullMQ)              │    │
│  │                            │  │                        │    │
│  │  ┌──────────────────────┐ │  │  ┌──────────────────┐ │    │
│  │  │  Auth & Sessions     │ │  │  │  Content Mod     │ │    │
│  │  │  Posts & Comments    │ │  │  │  Media Process   │ │    │
│  │  │  Users & Profiles    │ │  │  │  Notifications   │ │    │
│  │  │  Media Management    │ │  │  │  Analytics       │ │    │
│  │  │  Notifications       │ │  │  └──────────────────┘ │    │
│  │  │  Admin & Moderation  │ │  │                        │    │
│  │  │  Tokens & Wallets    │ │  │                        │    │
│  │  │  AI & VR APIs        │ │  │                        │    │
│  │  └──────────────────────┘ │  └────────────────────────┘    │
│  └────────────────────────────┘                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   Cloudflare R2  │     │
│  │   (Neon)     │  │  (Upstash)   │  │  (Media Storage) │     │
│  │              │  │              │  │                  │     │
│  │  • Users     │  │  • Sessions  │  │  • Images        │     │
│  │  • Posts     │  │  • Cache     │  │  • Videos        │     │
│  │  • Comments  │  │  • Job Queue │  │  • Documents     │     │
│  │  • Files     │  │  • Pub/Sub   │  │                  │     │
│  │  • Wallets   │  │              │  │                  │     │
│  │  • Audit Log │  │              │  │                  │     │
│  └──────────────┘  └──────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### Users & Authentication
- **roles**: Role definitions (OWNER, ADMIN, MODERATOR, VERIFIED_CREATOR, USER)
- **users**: User accounts with authentication credentials
- **tokens**: Refresh token storage for authentication

#### Content
- **posts**: All content across zones (text, images, videos, links)
  - `zone_key`: Zone identifier (home, you, pin, pix, thread, x, vr, ai)
  - `is_illegal`: Content flagging
  - `is_banned`: Ban status
- **comments**: Nested comments on posts
- **reactions**: Likes, loves, and other reactions
- **files**: Media file metadata
- **videos**: Video-specific metadata

#### Social Features
- **boards**: Pin-Zone collections
- **board_items**: Items in boards
- **chats**: Chat/message groups
- **chat_participants**: Participants in chats
- **messages**: Direct messages

#### Economy
- **wallets**: User token balances ($FREEDOM)
- **transactions**: Token transfers, tips, boosts

#### System
- **notifications**: User notifications
- **audit_logs**: Immutable action logs for compliance

### Entity Relationships

```
User ─────┬──── Posts (1:N)
          ├──── Comments (1:N)
          ├──── Reactions (1:N)
          ├──── Files (1:N)
          ├──── Wallet (1:1)
          ├──── Transactions (1:N sender, 1:N receiver)
          ├──── Boards (1:N)
          ├──── Messages (1:N)
          └──── Notifications (1:N)

Post ─────┬──── Comments (1:N)
          ├──── Reactions (1:N)
          ├──── Board Items (1:N)
          └──── File (N:1)

Comment ──┬──── Comments (1:N parent-child)
          └──── User (N:1)
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get tokens
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user

### Users (`/api/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update profile
- `GET /:id` - Get user by ID
- `POST /:id/follow` - Follow user
- `DELETE /:id/follow` - Unfollow user
- `POST /:id/block` - Block user
- `POST /:id/mute` - Mute user

### Posts (`/api/posts`)
- `GET /` - Get feed (supports `?zone_key=`)
- `GET /:id` - Get specific post
- `POST /` - Create post
- `DELETE /:id` - Delete post
- `POST /:id/flag-illegal` - Flag illegal content
- `POST /:id/unban` - Owner override to unban

### Comments (`/api/comments`)
- `GET /posts/:id/comments` - Get comments for post
- `POST /posts/:id/comments` - Create comment
- `DELETE /:id` - Delete comment

### Files (`/api/files`)
- `POST /upload` - Upload media file
- `GET /:id` - Get file metadata
- `DELETE /:id` - Delete file

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `POST /:id/read` - Mark as read
- `POST /read-all` - Mark all as read

### Tokens (`/api/tokens`)
- `GET /balance` - Get token balance
- `POST /boost` - Purchase post boost
- `GET /transactions` - Get transaction history

### Admin (`/api/admin`)
- `GET /analytics` - Get platform analytics
- `GET /users` - List all users
- `POST /users/:id/ban` - Ban user
- `DELETE /users/:id/ban` - Unban user

### AI (`/api/ai`)
- AI integration endpoints (future)

### VR (`/api/vr`)
- VR world endpoints (future)

## Data Flows

### User Registration & Login

```
Client                    API                      Database
  │                        │                          │
  ├─── POST /auth/register ─▶                        │
  │                        ├─── Validate input       │
  │                        ├─── Hash password        │
  │                        ├─── Create user ────────▶│
  │                        │                          │
  │◀──── User created ─────┤                          │
  │                        │                          │
  ├─── POST /auth/login ───▶                         │
  │                        ├─── Lookup user ─────────▶│
  │                        │◀─── User data ──────────┤
  │                        ├─── Verify password      │
  │                        ├─── Generate tokens      │
  │                        ├─── Store refresh token ─▶│
  │◀──── Tokens ───────────┤                          │
  │                        │                          │
```

### Post Creation & Feed

```
Client                    API                  Worker              Database
  │                        │                      │                   │
  ├─── POST /posts ────────▶                     │                   │
  │   (with JWT)           ├─── Verify token     │                   │
  │                        ├─── Create post ─────┼──────────────────▶│
  │                        │                      │                   │
  │◀──── Post created ─────┤                      │                   │
  │                        │                      │                   │
  │                        ├─── Queue moderation ─▶                   │
  │                        │                      ├─── Check content  │
  │                        │                      ├─── Flag if needed ▶│
  │                        │                      │                   │
  │                        │                      │                   │
  ├─── GET /posts?zone=you ▶                     │                   │
  │                        ├─── Query posts ──────┼──────────────────▶│
  │                        │◀─── Posts ───────────┼───────────────────┤
  │◀──── Feed data ────────┤                      │                   │
  │                        │                      │                   │
```

### Real-time Notifications

```
Client A                  API                  WebSocket           Client B
  │                        │                      │                   │
  ├─── POST /posts/:id/like ▶                    │                   │
  │                        ├─── Create reaction ─▶                   │
  │                        ├─── Create notification                  │
  │                        ├─── Emit event ───────▶                  │
  │                        │                      ├─── Push to B ────▶│
  │◀──── Success ──────────┤                      │                   │
  │                        │                      │                   │
```

### Media Upload

```
Client                    API                  R2 Storage          Database
  │                        │                      │                   │
  ├─── POST /files/upload ─▶                     │                   │
  │   (multipart)          ├─── Validate file    │                   │
  │                        ├─── Upload to R2 ────▶│                   │
  │                        │◀─── URL ─────────────┤                   │
  │                        ├─── Save metadata ────┼──────────────────▶│
  │◀──── File info ────────┤                      │                   │
  │                        │                      │                   │
```

## Security Layers

### 1. Edge Layer (Cloudflare)
- DDoS protection
- Bot mitigation
- Rate limiting
- TLS termination
- Geographic filtering

### 2. API Gateway Layer
- Request ID injection
- Basic rate limit headers
- CORS handling
- Request logging

### 3. Application Layer
- JWT verification
- Role-based access control (RBAC)
- Input validation
- SQL injection prevention (Sequelize ORM)
- XSS prevention
- CSRF protection

### 4. Data Layer
- Encrypted connections (SSL/TLS)
- Password hashing (bcrypt)
- Encrypted storage (database at rest)

## Content Moderation Flow

```
Post Created
    │
    ├─── Instant Check (sync)
    │    ├─── Banned words
    │    ├─── Spam patterns
    │    └─── Rate limits
    │
    ├─── Background Check (async)
    │    ├─── Content analysis
    │    ├─── URL scanning
    │    ├─── Media scanning
    │    └─── User history check
    │
    ├─── Flag if suspicious
    │    ├─── Add to moderation queue
    │    └─── Notify moderators
    │
    └─── Action
         ├─── Delete (illegal content)
         ├─── Ban user (permanent)
         ├─── Flag for review
         └─── Log in audit trail
```

## Zone System

Each zone operates as a filtered view of the posts table:

- **home**: All content (zone_key = null or 'home')
- **you**: Video content (zone_key = 'you', type = 'VIDEO')
- **pin**: Board collections (zone_key = 'pin')
- **pix**: Image galleries (zone_key = 'pix', type = 'IMAGE')
- **thread**: Discussions (zone_key = 'thread')
- **x**: Trending/signals (zone_key = 'x')
- **vr**: VR experiences (zone_key = 'vr')
- **ai**: AI interactions (zone_key = 'ai')

All feeds are **strictly reverse chronological** (ORDER BY created_at DESC).

## Background Jobs (BullMQ)

### Job Queues

1. **content-moderation**
   - Post analysis
   - Illegal content detection
   - Spam filtering

2. **media-processing**
   - Video transcoding
   - Image optimization
   - Thumbnail generation
   - Upload to R2

3. **notifications**
   - Email delivery
   - Push notifications
   - WebSocket broadcasts
   - Batch notifications

4. **analytics**
   - Usage metrics
   - Performance stats
   - Report generation

## Monitoring & Observability

### Metrics
- Request count per endpoint
- Response time (p50, p95, p99)
- Error rate
- Active connections
- Database query performance
- Job queue length
- Media storage usage

### Logs
- Application logs (structured JSON)
- Access logs (requests/responses)
- Error logs (with stack traces)
- Audit logs (sensitive operations)

### Alerts
- High error rate
- Slow response times
- Database connection issues
- Job queue backlog
- Storage quota approaching limit

## Scaling Strategy

### Horizontal Scaling
- Frontend: Auto-scales via CDN
- API: Multiple container instances behind load balancer
- Worker: Multiple worker instances
- Database: Read replicas

### Vertical Scaling
- Increase container resources
- Upgrade database tier
- Increase Redis memory

### Caching Strategy
- Edge caching (Cloudflare)
- API response caching (Redis)
- Database query caching
- Static asset caching (R2 + CDN)

## Disaster Recovery

### Backup Schedule
- Database: Automated daily snapshots
- R2 Media: Cross-region replication
- Audit Logs: Retained for 7 years

### Recovery Procedures
1. Database restore from snapshot
2. Container redeployment from images
3. DNS failover to backup region
4. Media recovery from replicas

### RTO/RPO
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 15 minutes

## Compliance

### Data Protection
- GDPR compliant
- User data export available
- Right to deletion
- Audit trail maintained

### Content Policies
- Illegal content instant deletion
- User permanent ban
- Owner override capability
- All actions logged

---

Last Updated: 2024-12-21
