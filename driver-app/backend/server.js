// backend/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import locationRoutes from './routes/locations.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import database
import { testConnection } from './config/database.js';
// Background cleanup job
import { startCleanupJob } from './services/cleanupService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Driver App Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Driver App Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Authenticate driver',
'GET /api/auth/driver/:driverId': 'Get driver information',
        'POST /api/auth/logout': 'Logout driver and reset statuses'
      },
      trips: {
        'GET /api/trips/active/:driverId': 'Get active trip for driver',
        'POST /api/trips/start': 'Start new trip',
        'POST /api/trips/end': 'End active trip',
        'GET /api/trips/:tripId': 'Get trip details'
      },
      locations: {
        'POST /api/locations': 'Save GPS location',
'GET /api/locations/trip/:tripId': 'Get location history',
        'GET /api/locations/latest/:tripId': 'Get latest location by trip',
        'GET /api/locations/latest-by-bus/:busNumber': 'Get latest location by bus',
        'GET /api/locations/active': 'Get all active locations'
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will continue but may not function properly.');
    }

    app.listen(PORT, () => {
      console.log('🚀 Driver App Backend Server Started');
      console.log('================================');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🗄️ Database: ${dbConnected ? 'Connected' : 'Connection failed'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('================================');
      // Start background cleanup job to prune intermediary coordinates
      startCleanupJob();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();