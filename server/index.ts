import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth';
import itemsRoutes from './routes/items';
import { errorHandler, apiLimiter } from './middleware';
import { connectDB } from './db-mongo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', itemsRoutes);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const ssrCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000;

app.get('/api/cache-status', (req, res) => {
  res.json({
    cacheSize: ssrCache.size,
    entries: Array.from(ssrCache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
    })),
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('itemUpdated', (data) => {
    badCache.push(data);
    
    // Broadcast to all connected clients
    io.emit('itemUpdated', data);
  });
});

let badCache: any[] = [];

// Error handling
app.use(errorHandler);

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
