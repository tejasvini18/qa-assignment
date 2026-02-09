# Buggy MERN App - QA Take-Home Assessment

This is a deliberately buggy MERN (MongoDB, Express, React, Node.js) application designed as a technical assessment for QA engineers. The application contains defects across functional logic, security, performance, API contracts, and UX categories.


## Tech Stack

- **Frontend:** Next.js with TypeScript and React
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with refresh token rotation
- **Real-time:** Socket.IO for WebSocket updates
- **File Upload:** Multer for image uploads
- **Containerization:** Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development without Docker)
- MongoDB (if running without Docker)

### Using Docker Compose (Recommended)

```bash
# Clone and navigate to project
cd buggy-mern-app

# Start all services
docker-compose up --build

# In another terminal, seed the database
docker-compose exec api npm run seed

# Run smoke tests
docker-compose exec api npm run test:smoke
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **MongoDB:** mongodb://localhost:27017

### Local Development (Without Docker)

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start MongoDB (ensure it's running on port 27017)
mongod

# In one terminal, start the API
npm run dev

# In another terminal, start the frontend
cd client && npm run dev

# Seed the database
npm run seed

# Run smoke tests
npm run test:smoke
```

## Default Credentials

The seed script creates three test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | AdminPass123! | admin |
| editor@example.com | EditorPass123! | editor |
| user@example.com | UserPass123! | user |

## Project Structure

```
buggy-mern-app/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── models.ts          # MongoDB schemas
│   ├── auth-utils.ts      # JWT utilities
│   ├── middleware.ts      # Express middleware
│   ├── db-mongo.ts        # MongoDB connection
│   └── index.ts           # Main server file
├── scripts/               # Utility scripts
│   ├── seed.ts            # Database seeding
│   └── smoke-tests.ts     # Basic API tests
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile.api         # API service Dockerfile
├── Dockerfile.web         # Web service Dockerfile
└── README.md              # This file
```

## Available Scripts

### Development

```bash
# Start development server (API)
npm run dev

# Start frontend development server
cd client && npm run dev

# Type checking
npm run check

# Format code
npm run format
```

### Database

```bash
# Seed database with sample data
npm run seed

# Push database schema changes
npm run db:push
```

### Testing

```bash
# Run smoke tests (basic API validation)
npm run test:smoke

# Run unit tests
npm run test
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token

### Items

- `GET /api/items` - List items with pagination and search
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item (requires editor/admin role)
- `PUT /api/items/:id` - Update item (requires editor/admin role)
- `DELETE /api/items/:id` - Delete item (requires admin role)
- `POST /api/items/:id/upload` - Upload item image

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec api npm run seed
```

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment (development/production)
- `PORT` - API server port

## Development Notes

- The application uses TypeScript for type safety
- ESLint and Prettier are configured for code quality
- Vitest is used for unit testing
- Socket.IO is configured for real-time updates
- Multer handles file uploads to the `uploads/` directory

## Troubleshooting

### MongoDB Connection Error

Ensure MongoDB is running and accessible at the configured `MONGODB_URI`.

### Port Already in Use

Change the port in `.env` or Docker Compose configuration.

### Dependencies Installation Issues

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Docker Build Issues

```bash
# Clean up and rebuild
docker-compose down -v
docker-compose up --build
```
