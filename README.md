# Nebria – Universe of Social Platforms

Welcome to the Nebria super-app repository! This project combines a rich frontend experience with a robust backend API to power a comprehensive social media platform with multiple specialized zones (You-Zone, Pin-Zone, Pix-Zone, Thread-Zone, and more).

## Repository Structure

```
nebriamasterbuild/
├── frontend/           # Frontend application (single-page HTML app)
│   └── index.html     # Main UI with all social platform features
├── backend/           # Backend API (Node.js + Express + Sequelize)
│   ├── src/          # Source code (routes, models, middleware, services)
│   ├── package.json  # Node.js dependencies
│   ├── Dockerfile    # Backend container definition
│   └── schema.sql    # PostgreSQL database schema
├── docker-compose.yml # Multi-service orchestration
└── README.md         # This file
```

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed on your machine
- No other services running on ports 3000, 5432, 6379

### Running the Application

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/russsalesmanager-rgb/nebriamasterbuild.git
   cd nebriamasterbuild
   ```

2. **Start all services** using Docker Compose:
   ```bash
   docker compose up --build
   ```

   This command will:
   - Build the backend API container
   - Start PostgreSQL database (port 5432)
   - Start Redis cache (port 6379)
   - Start the backend API server (port 3000)
   - Start a worker service placeholder for background jobs

3. **Wait for services to be ready**. You should see logs indicating:
   - PostgreSQL is ready to accept connections
   - Backend API is listening on port 3000

4. **Open the frontend** in your web browser:
   ```
   file:///path/to/nebriamasterbuild/frontend/index.html
   ```
   
   Or use a simple HTTP server:
   ```bash
   # Using Python
   cd frontend
   python3 -m http.server 8080
   # Then open http://localhost:8080
   
   # Or using Node.js
   npx http-server frontend -p 8080
   # Then open http://localhost:8080
   ```

### Configuring API Connection

The frontend currently runs as a standalone HTML file with mock data. To connect it to the backend API:

1. **Set the API_BASE_URL** in the frontend JavaScript:
   - Open `frontend/index.html` in a text editor
   - Find the API configuration section (typically near the top of the `<script>` tag)
   - Update the API_BASE_URL:
     ```javascript
     const API_BASE_URL = 'http://localhost:3000/api';
     ```

2. **Handle CORS**: The backend is configured with CORS enabled by default, allowing requests from any origin during development.

3. **Authentication**: To use authenticated endpoints:
   - Register a new user via `POST /api/auth/register`
   - Login via `POST /api/auth/login` to receive a JWT token
   - Include the token in subsequent requests: `Authorization: Bearer <token>`

## Services Overview

### Backend API (Port 3000)
- **Framework**: Express.js with Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth with refresh tokens
- **Real-time**: Socket.io for live updates
- **API Endpoints**: `/api/auth`, `/api/users`, `/api/posts`, `/api/comments`, `/api/files`, `/api/tokens`, `/api/messages`, `/api/notifications`, `/api/admin`, `/api/ai`, `/api/vr`

### PostgreSQL (Port 5432)
- **Database**: `nebria`
- **User**: `nebria`
- **Password**: `nebria`
- Schema is automatically initialized from `backend/schema.sql`

### Redis (Port 6379)
- Used for caching and session management (future implementation)
- Available for background job queuing

### Worker Service
- Placeholder service for background job processing
- Future implementations: video transcoding, email sending, notification dispatch

## Development

### Backend Development

To develop the backend locally without Docker:

```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=3000
DB_NAME=nebria
DB_USER=nebria
DB_PASS=nebria
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=supersecret
REFRESH_SECRET=refreshsupersecret
NODE_ENV=development
```

Start the backend:
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

### Frontend Development

The frontend is a self-contained HTML file with embedded CSS and JavaScript. Simply edit `frontend/index.html` and refresh your browser.

## Stopping the Application

To stop all services:
```bash
docker compose down
```

To stop and remove all data (including database):
```bash
docker compose down -v
```

## Architecture

- **Frontend**: Single-page application with multiple "zones" (You-Zone for videos, Pin-Zone for boards, Pix-Zone for images, Thread-Zone for discussions, etc.)
- **Backend**: RESTful API with WebSocket support for real-time features
- **Database**: PostgreSQL with normalized schema for users, posts, comments, files, tokens, wallets, messages, notifications
- **Cache**: Redis for session management and background jobs
- **Containers**: Docker Compose orchestrates all services for easy local development

## Future Enhancements

- Connect frontend to backend API (currently uses mock data)
- Implement Redis caching layer
- Build out worker service for background jobs
- Add CI/CD pipeline
- Implement S3-compatible object storage for file uploads
- Add monitoring and logging
- Production deployment configurations

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test locally with `docker compose up --build`
4. Submit a pull request

## License

MIT

---

For more detailed backend documentation, see `backend/README.md`.
