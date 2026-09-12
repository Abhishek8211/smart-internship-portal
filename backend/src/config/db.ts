import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sip';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected successfully to Atlas.');
  } catch (err: any) {
    console.error('❌ MongoDB Atlas connection failure:', err.message);
    process.exit(1);
  }
};

// PostgreSQL Prisma Setup
export const prisma = new PrismaClient({
  log: ['error', 'warn']
});

export const connectPostgreSQL = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma.');
  } catch (err: any) {
    console.error('❌ PostgreSQL connection failure via Prisma:', err.message);
    process.exit(1);
  }
};

export const getDbStatus = () => ({
  mongo: mongoose.connection.readyState === 1,
  postgres: true // Handled by Prisma
});
