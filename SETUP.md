# Buggy MERN App - Setup Guide

This guide provides step-by-step instructions for setting up and running the Buggy MERN application for QA assessment purposes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker Compose)](#quick-start-docker-compose)
3. [Local Development Setup](#local-development-setup)
4. [Project Structure](#project-structure)
5. [Available Commands](#available-commands)
6. [Environment Configuration](#environment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Docker Setup (Recommended)
- Docker (v20.10+)
- Docker Compose (v2.0+)

### For Local Development
- Node.js (v22+)
- npm or pnpm (v10+)
- MongoDB (v7+)
- Git

---

## Quick Start (Docker Compose)

The easiest way to get the application running is with Docker Compose, which sets up MongoDB, API server, and web frontend automatically.

### Step 1: Clone and Navigate

```bash
cd buggy-mern-app
```

### Step 2: Start All Services

```bash
docker-compose up --build
```

This command will:
- Build the API service (Express + Node.js)
- Build the web service (React + Vite)
- Start MongoDB container
- Expose ports: 3000 (frontend), 3001 (API), 27017 (MongoDB)

### Step 3: Seed Database (in another terminal)

```bash
docker-compose exec api npm run seed
```

This creates test accounts:
- **Admin:** admin@example.com / AdminPass123!
- **Editor:** editor@example.com / EditorPass123!
- **User:** user@example.com / UserPass123!

### Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **MongoDB:** mongodb://localhost:27017/buggy-mern-app

### Step 5: Run Smoke Tests (Optional)

```bash
docker-compose exec api npm run test:smoke
```

---

## Local Development Setup

If you prefer to run services locally without Docker:

### Step 1: Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd client && pnpm install && cd ..
```

### Step 2: Start MongoDB

Ensure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run MongoDB in Docker
docker run -d -p 27017:27017 --name buggy-mern-mongo mongo:7
```

### Step 3: Create .env File

Copy the example and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
MONGODB_URI=mongodb://localhost:27017/buggy-mern-app
JWT_SECRET=weak-secret-key-123
REFRESH_TOKEN_SECRET=weak-refresh-secret-456
NODE_ENV=development
PORT=3001
VITE_API_BASE=http://localhost:3001
```

### Step 4: Start the API Server

In one terminal:

```bash
npm run dev
```

The API will start on http://localhost:3001

### Step 5: Start the Frontend

In another terminal:

```bash
npm run dev:web
```

The frontend will start on http://localhost:3000

### Step 6: Seed Database

In a third terminal:

```bash
npm run seed
```

### Step 7: Run Smoke Tests (Optional)

```bash
npm run test:smoke
```

---

## Project Structure

```
buggy-mern-app/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Items list (with pagination bugs)
│   │   │   ├── ItemDetail.tsx       # Item detail (with XSS vulnerability)
│   │   │   ├── Login.tsx            # Login page (client-only validation)
│   │   │   ├── Signup.tsx           # Signup page
│   │   │   └── AdminDashboard.tsx   # Admin panel (RBAC bypass)
│   │   ├── components/              # Reusable components
│   │   ├── hooks/                   # Custom hooks (useSocket)
│   │   ├── App.tsx                  # Route definitions
│   │   └── main.tsx                 # Entry point
│   ├── index.html
│   └── package.json
│
├── server/                          # Express backend
│   ├── routes/
│   │   ├── auth.ts                  # Auth endpoints (signup, login, refresh)
│   │   └── items.ts                 # Items CRUD endpoints
│   ├── models.ts                    # MongoDB schemas
│   ├── middleware.ts                # Auth & rate limiting middleware
│   ├── auth-utils.ts                # JWT utilities
│   ├── db-mongo.ts                  # MongoDB connection
│   ├── index.ts                     # Express server entry point
│   └── _core/                       # Framework files (do not modify)
│
├── scripts/
│   ├── seed.ts                      # Database seeding script
│   └── smoke-tests.ts               # Basic API tests
│
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile.api                   # API service Dockerfile
├── Dockerfile.web                   # Web service Dockerfile
├── .env.example                     # Environment variables template
├── SETUP.md                         # This file
├── DEFECTS.md                       # All 28 defects documentation
├── README.md                        # Project overview
└── recruiter-instructions.md        # Recruiter-only defect mapping

```

---

## Available Commands

### Development

```bash
# Start API server (watches for changes)
npm run dev

# Start API server only
npm run dev:api

# Start frontend only (from client directory)
npm run dev:web

# Type checking
npm run check

# Format code
npm run format
```

### Database

```bash
# Seed database with sample data
npm run seed
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

### Docker

```bash
# Start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec api npm run seed
docker-compose exec api npm run test:smoke

# Remove volumes (clean database)
docker-compose down -v
```

---

## Environment Configuration

### Available Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://mongo:27017/buggy-mern-app` | MongoDB connection string |
| `JWT_SECRET` | `weak-secret-key-123` | JWT signing secret (intentionally weak) |
| `REFRESH_TOKEN_SECRET` | `weak-refresh-secret-456` | Refresh token secret (intentionally weak) |
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3001` | API server port |
| `VITE_API_BASE` | `http://localhost:3001` | Frontend API base URL |

### Security Notes

The default JWT secrets are **intentionally weak** for QA assessment purposes. In production:

```env
JWT_SECRET=your-strong-random-secret-here-min-32-chars
REFRESH_TOKEN_SECRET=your-strong-random-secret-here-min-32-chars
```

Generate strong secrets:

```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Troubleshooting

### MongoDB Connection Error

**Problem:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check connection string in `.env`
3. If using Docker: `docker ps | grep mongo`
4. Restart MongoDB: `docker-compose down && docker-compose up`

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3001`

**Solution:**
1. Find process using port: `lsof -i :3001`
2. Kill process: `kill -9 <PID>`
3. Or change port in `.env`: `PORT=3002`

### Dependencies Installation Issues

**Problem:** `npm ERR! ERR! code ERESOLVE`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install --force
```

### Docker Build Fails

**Problem:** `docker: command not found` or build errors

**Solution:**
```bash
# Ensure Docker is running
docker --version

# Clean up and rebuild
docker-compose down -v
docker-compose up --build --no-cache
```

### Frontend Not Connecting to API

**Problem:** `Failed to fetch /api/items`

**Solution:**
1. Verify API is running: `curl http://localhost:3001/api/items`
2. Check `VITE_API_BASE` in `.env`
3. Check browser console for CORS errors
4. Verify API and frontend are on same network (Docker)

### Seed Script Fails

**Problem:** `MongoError: E11000 duplicate key error`

**Solution:**
```bash
# Clear database and reseed
docker-compose down -v
docker-compose up
docker-compose exec api npm run seed
```

### Tests Failing

**Problem:** Smoke tests fail with connection errors

**Solution:**
1. Ensure all services are running: `docker-compose ps`
2. Wait for MongoDB to be ready: `docker-compose logs mongo`
3. Manually test API: `curl http://localhost:3001/api/items`

---

## Development Workflow

### Making Changes

1. **Backend Changes:**
   - Edit files in `server/` directory
   - Server auto-reloads (tsx watch)
   - Test with: `curl http://localhost:3001/api/items`

2. **Frontend Changes:**
   - Edit files in `client/src/` directory
   - Browser auto-refreshes (Vite HMR)
   - Check browser console for errors

3. **Database Changes:**
   - Edit schema in `server/models.ts`
   - Restart server: `npm run dev`
   - Reseed if needed: `npm run seed`

### Testing Changes

```bash
# Run smoke tests
npm run test:smoke

# Run unit tests
npm run test

# Check types
npm run check
```

---

## Common Tasks

### Create a New API Endpoint

1. Add route handler in `server/routes/items.ts` or `server/routes/auth.ts`
2. Add middleware if needed (auth, rate limiting)
3. Test with curl or Postman
4. Update frontend to call new endpoint

### Add Database Field

1. Update schema in `server/models.ts`
2. Restart server
3. Reseed database if needed
4. Update API endpoints to handle new field

### Debug API Issues

```bash
# View server logs
docker-compose logs api

# Connect to MongoDB
docker-compose exec mongo mongosh

# Check database
db.items.find()
db.users.find()
```

### Reset Everything

```bash
# Stop services
docker-compose down

# Remove volumes (delete database)
docker-compose down -v

# Rebuild and restart
docker-compose up --build

# Reseed
docker-compose exec api npm run seed
```

---


**Last Updated:** February 2026  
**Version:** 1.0
