# Nebria Master Build

**Nebria** is an ambitious social media super-platform that combines features from YouTube, Pinterest, Instagram, Reddit, and more into a unified ecosystem. This repository contains the complete source code for both the frontend and backend, along with local development infrastructure.

## Project Structure

```
nebriamasterbuild/
├── frontend/           # Frontend HTML application
│   └── index.html     # Single-page application with all UI components
├── backend/           # Node.js Express backend API
│   ├── src/          # Source code (routes, models, middleware, services)
│   ├── package.json  # Node.js dependencies
│   ├── schema.sql    # PostgreSQL database schema
│   └── README.md     # Detailed backend documentation
├── docker-compose.yml # Local development environment
└── README.md         # This file
```

## Features

### Core Platform Capabilities
- **Social Feed**: Chronological timeline with posts, images, videos, and links
- **Video Hosting**: YouTube-style video upload, playback, and streaming
- **Boards**: Pinterest-style collections and content organization
- **Messaging**: Direct messages and group chats with real-time updates
- **Commerce**: Token economy with $FREEDOM cryptocurrency
- **AI Integration**: AI-powered content generation and interactions
- **VR Support**: Virtual reality world hosting and exploration
- **Moderation**: Comprehensive admin tools and content policies

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL with Sequelize ORM
- **Cache/Queue**: Redis (for sessions and background jobs)
- **Authentication**: JWT-based auth with refresh tokens
- **File Storage**: S3-compatible object storage (multer for uploads)

## Quick Start

### Prerequisites
- Docker and Docker Compose (for local development)
- Node.js 18+ (if running without Docker)
- PostgreSQL 15+ (if running without Docker)

### Local Development with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/russsalesmanager-rgb/nebriamasterbuild.git
   cd nebriamasterbuild
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

4. **View logs:**
   ```bash
   docker-compose logs -f api
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

### Manual Setup (Without Docker)

#### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:** Create a `.env` file:
   ```env
   PORT=3000
   DB_NAME=nebria
   DB_USER=nebria
   DB_PASS=nebria
   DB_HOST=localhost
   JWT_SECRET=supersecret
   REFRESH_SECRET=refreshsupersecret
   ```

3. **Initialize database:** Run the SQL in `backend/schema.sql` or let Sequelize sync models automatically.

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

#### Frontend Setup

Simply open `frontend/index.html` in a web browser, or serve it with any static file server:

```bash
cd frontend
python3 -m http.server 8080
# or
npx serve .
```

## Architecture

### Backend API

The backend is a RESTful API built with Express.js and organized into modular routes:

- **Authentication** (`/api/auth`): Registration, login, refresh tokens, logout
- **Users** (`/api/users`): User profiles, follows, bans
- **Posts** (`/api/posts`): Create, read, update, delete posts
- **Comments** (`/api/comments`): Nested comments on posts
- **Files** (`/api/files`): Upload images, videos, documents
- **Tokens** (`/api/tokens`): $FREEDOM token operations (buy, tip, boost)
- **Messages** (`/api/messages`): Direct messages and group chats
- **Notifications** (`/api/notifications`): Real-time notification system
- **Admin** (`/api/admin`): Moderation, user management, audit logs
- **AI** (`/api/ai`): AI-powered content generation
- **VR** (`/api/vr`): Virtual reality world management

Real-time features are powered by **Socket.io** for live chat and notifications.

### Database Schema

PostgreSQL database with the following main tables:
- `roles`, `users` - Authentication and user management
- `posts`, `comments`, `reactions` - Content and engagement
- `files`, `videos` - Media storage metadata
- `boards`, `board_items` - Content collections
- `tokens`, `wallets`, `transactions` - Token economy
- `chats`, `chat_participants`, `messages` - Messaging system
- `notifications` - Real-time notifications
- `audit_logs` - Administrative actions and compliance

See `backend/schema.sql` for complete schema definitions.

### Frontend

The frontend is a comprehensive single-page application that includes:
- Responsive navigation and layout
- Feed timeline with infinite scroll
- Video player with controls
- Board creation and management
- Real-time chat interface
- Token wallet and transactions
- Admin dashboard
- VR world browser

## Security

- **Passwords**: Hashed with bcrypt (never stored in plaintext)
- **Authentication**: JWT access tokens (15 min) + refresh tokens (7 days)
- **Authorization**: Role-based access control (OWNER, ADMIN, MODERATOR, VERIFIED_CREATOR, USER)
- **Input Validation**: Express-validator on all endpoints
- **Content Policies**: Illegal content detection and moderation tools

## Development

### Running Tests
```bash
cd backend
npm test  # (when tests are added)
```

### Database Migrations
```bash
# Using Sequelize CLI (install first: npm install -g sequelize-cli)
npx sequelize-cli db:migrate
```

### Adding New Features

1. **Backend**: Add new routes in `backend/src/routes/`, models in `backend/src/models/`
2. **Frontend**: Extend `frontend/index.html` with new components
3. **Database**: Update `backend/schema.sql` and create migrations

## Deployment

### Production Checklist

- [ ] Set strong JWT secrets in environment variables
- [ ] Configure PostgreSQL with proper credentials and backups
- [ ] Set up Redis for session storage and caching
- [ ] Configure S3-compatible storage for media files
- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Implement rate limiting and DDoS protection
- [ ] Set up monitoring and logging (e.g., Winston, Sentry)
- [ ] Configure CDN for static assets
- [ ] Implement video transcoding pipeline
- [ ] Set up automated backups

### Environment Variables

All sensitive configuration should be provided via environment variables. See `backend/README.md` for a complete list.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see backend README for details.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Nebria** - Building the future of decentralized social media.
