import express from 'express';
import { createServer } from 'http';
import { initSocketServer } from './services/socketService';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { connectMongoDB, connectPostgreSQL } from './config/db';

import authRoutes from './routes/auth';
import internshipRoutes from './routes/internships';
import applicationRoutes from './routes/applications';
import aiRoutes from './routes/ai';
import studentRoutes from './routes/student';
import recruiterRoutes from './routes/recruiter';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import publicRoutes from './routes/public';

import swaggerDocument from './swagger.json';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

// Base Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start Server
const startServer = async () => {
  console.log('🚀 Starting Smart Internship Matching Portal Server...');
  
  // Establish Database Connections
  await connectMongoDB();
  await connectPostgreSQL();

  const httpServer = createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`✅ Backend server running on port: http://localhost:${PORT}`);
    console.log(`📖 API documentation available at: http://localhost:${PORT}/api-docs`);
  });
};

startServer().catch((err) => {
  console.error('❌ Server startup failure:', err);
});
export default app;
