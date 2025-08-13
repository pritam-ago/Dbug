import mongoose from 'mongoose';

let isConnected = false;
let connection: mongoose.Connection | null = null;

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection = conn.connection;
    isConnected = true;

    connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    process.on('SIGINT', async () => {
      await disconnectFromDatabase();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (connection) {
    await connection.close();
    connection = null;
    isConnected = false;
  }
};

export const getConnectionStatus = (): boolean => {
  return isConnected;
};

export const getConnectionInfo = () => {
  if (!connection) {
    return null;
  }

  return {
    host: connection.host,
    port: connection.port,
    name: connection.name,
    readyState: connection.readyState,
  };
};

export const clientPromise = mongoose.connect(process.env.MONGODB_URI!);
