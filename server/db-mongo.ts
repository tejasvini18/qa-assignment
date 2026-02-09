import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/buggy-mern-app';
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('[MongoDB] Connected successfully');
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error('[MongoDB] Disconnection failed:', error);
    throw error;
  }
}

export function isDBConnected() {
  return isConnected;
}
