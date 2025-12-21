# Nebria Backend

This directory contains a complete backend implementation for the **Nebria** social media super‑platform.  The aim is to translate the ambitious single‑file HTML demo into a real, production‑grade service architecture that can power You‑Tube‑like video hosting, Pinterest‑style boards, Instagram galleries, threaded discussion forums, chronological feeds, monetisation, AI interactions, administrative control and VR sessions.

## Overview

The backend is built with **Node.js**, **Express** and **Sequelize** (PostgreSQL) and is designed to be modular.  Each core domain (authentication, users, posts, comments, files, tokens, messages, notifications, admin, AI and VR) is encapsulated in its own router under `src/routes`.  Models are defined with Sequelize under `src/models`, and real‑time communication is provided via **Socket.io**.  File uploads are stored in an S3‑compatible object store; a `storageService` encapsulates this integration.

### Folder Structure

```
nebria-backend/
├── package.json        # Node.js package manifest
├── .env               # Environment variables (not committed)
├── Dockerfile         # (optional) container build
├── docker-compose.yml # (optional) multi‑service orchestration
├── schema.sql         # SQL definitions for all tables
└── src/
    ├── server.js      # App entry point (Express + Socket.io)
    ├── config/
    │   └── db.js      # PostgreSQL connection via Sequelize
    ├── middleware/
    │   ├── auth.js    # JWT auth and role enforcement
    ├── models/
    │   ├── index.js   # Model initialiser and association builder
    │   ├── roleModel.js
    │   ├── userModel.js
    │   ├── postModel.js
    │   ├── commentModel.js
    │   ├── reactionModel.js
    │   ├── fileModel.js
    │   ├── videoModel.js
    │   ├── boardModel.js
    │   ├── boardItemModel.js
    │   ├── tokenModel.js
    │   ├── walletModel.js
    │   ├── transactionModel.js
    │   ├── chatModel.js
    │   ├── chatParticipantModel.js
    │   ├── messageModel.js
    │   ├── notificationModel.js
    │   └── auditLogModel.js
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── posts.js
    │   ├── comments.js
    │   ├── files.js
    │   ├── tokens.js
    │   ├── messages.js
    │   ├── notifications.js
    │   ├── admin.js
    │   ├── ai.js
    │   └── vr.js
    ├── services/
    │   └── storageService.js
    └── sockets/
        └── (future socket event handlers)
```

## Database Schema

All entities are normalised and stored in PostgreSQL.  The `schema.sql` file contains the raw SQL definitions used by Sequelize.  Key tables include:

- `roles`: Defines built‑in roles — `OWNER`, `ADMIN`, `MODERATOR`, `VERIFIED_CREATOR`, `USER` — used for server‑side permission checks.
- `users`: Stores basic user information, hashed passwords and role membership.
- `posts`: Represents all feed items.  Supports different `type` values (`TEXT`, `IMAGE`, `VIDEO`, `LINK`, `MULTIMEDIA`), optional `mediaId` for attachments and `parentId` for reply/repost relationships.
- `comments`: Nested comments tied to posts; supports unlimited depth via `parentId`.
- `reactions`: Reaction (like/love/etc.) tracking per post and user.
- `files`: Metadata about uploaded objects (images, videos, documents) stored in S3.
- `videos`: Additional metadata for video content (title, description, duration, transcoding status).
- `boards` and `board_items`: Pinterest‑like collections of posts.
- `tokens`, `wallets` and `transactions`: Implements the `$FREEDOM` token economy.  `wallets` hold integer balances and `transactions` record transfers (tips, boosts, purchases, platform fees).
- `chats`, `chat_participants` and `messages`: Support direct messages and group chats via WebSockets.
- `notifications`: Tracks likes, replies, follows, mentions and direct messages.  A WebSocket push layer delivers these in real time.
- `audit_logs`: Immutable logs capturing administrative actions for compliance and transparency.

## Authentication & Roles

Authentication uses **JWT** access tokens (15 minute expiry) and **refresh** tokens (7 day expiry).  Passwords are hashed with **bcrypt**.  The `auth` routes support registration, login, refresh and logout.  The `authMiddleware` verifies access tokens and attaches the decoded user payload to each request.  The `requireRole` helper enforces role‑based permissions on protected routes.

Roles are stored in the `roles` table and linked to users via `roleId`.  Owners bypass all restrictions; administrators and moderators can manage users and posts; verified creators may gain additional privileges in the future.

## File Storage

File uploads are handled via **multer** and stored temporarily on disk.  The `storageService` demonstrates how you would upload files to an S3‑compatible store.  In production you should configure your S3 endpoint, bucket and credentials via environment variables and persist uploaded objects there.  Uploaded files are tracked in the `files` table.

## Real‑time Communication

The server boots a **Socket.io** instance attached to the HTTP server.  When a client connects they should supply their JWT in the query string for authentication (not yet implemented).  Rooms are used to broadcast chat messages and notifications.  The `messages` and `notifications` routes show how to emit events to the correct room.

## Deployment

1. **Install Dependencies:**
   ```sh
   cd nebria-backend
   npm install
   ```

2. **Configure Environment:** Create a `.env` file with at least the following variables:
   ```env
   PORT=3000
   DB_NAME=nebria
   DB_USER=nebria
   DB_PASS=your_database_password
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret
   REFRESH_SECRET=your_refresh_secret
   S3_ENDPOINT=https://your-s3-endpoint
   S3_BUCKET=nebria-media
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```

3. **Initialise the Database:** Run the SQL in `schema.sql` against your PostgreSQL instance or allow Sequelize to sync models automatically (as the current code does via `db.sync()` in `server.js`).

4. **Run the Server:**
   ```sh
   npm start
   ```

5. **Optional – Docker:** A simple `Dockerfile` and `docker-compose.yml` can be added to containerise the app alongside PostgreSQL and object storage.  For brevity these files are not included here.

## Security Notes

- **Input Validation:** Express‑validator is used throughout to enforce strong typing and sensible lengths on user input.
- **Password Security:** Passwords are salted and hashed with bcrypt.  Plaintext passwords are never stored.
- **JWT Best Practices:** Access tokens are short‑lived.  Refresh tokens are stored server‑side (in memory here, but should be persisted for revocation).  Always transmit tokens over HTTPS.
- **Role Enforcement:** Critical actions (e.g., changing roles, deleting posts, banning users) are guarded by role checks.  The owner role can override any restriction.
- **Content Policies:** The frontend should implement illegal content detection and call the admin API to remove offending posts.  The backend offers simple delete endpoints but does not itself inspect uploaded media.

## Extensibility

This codebase is intentionally modular.  New features (e.g., advanced AI tool usage, VR world synchronisation, analytics dashboards, ad serving) can be added as new models, services and routes without disturbing the existing structure.  You should also implement rate limiting, comprehensive unit/integration tests and full audit logging for production deployments.

---

The Nebria backend is a foundation for a world‑scale social media platform.  To complete the vision described in the original single‑file demo you will need to further implement video transcoding, S3 integration, admin moderation queues, advertisement management, trending algorithms (purely based on volume and recency), AI model billing, VR world state and a polished UI integration.  The provided skeleton gives you a robust starting point to achieve that ambition.