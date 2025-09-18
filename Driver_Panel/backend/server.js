// backend/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import locationRoutes from './routes/locations.js';
import adminRoutes from './routes/admin.js';

// Import services
import { CleanupService, startCleanupJob } from './services/cleanupService.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import database
import { testConnection } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
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
app.use('/api/admin', adminRoutes);

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
      },
      admin: {
        'POST /api/admin/auth/login': 'Admin login',
        'GET /api/admin/stats': 'Get system statistics',
        'GET /api/admin/routes': 'Get all routes',
        'POST /api/admin/routes': 'Create new route',
        'PUT /api/admin/routes/:routeId': 'Update route',
        'DELETE /api/admin/routes/:routeId': 'Delete route',
        'GET /api/admin/routes/:routeId/stops': 'Get route stops',
        'POST /api/admin/routes/:routeId/stops': 'Add route stop',
        'GET /api/admin/drivers': 'Get all drivers',
        'PUT /api/admin/drivers/:driverId/assign-route': 'Assign driver to route',
        'GET /api/admin/buses': 'Get all buses',
        'POST /api/admin/buses': 'Create new bus',
        'PUT /api/admin/buses/:busNumber': 'Update bus',
        'DELETE /api/admin/buses/:busNumber': 'Delete bus',
        'PUT /api/admin/buses/:busNumber/assign-route': 'Assign bus to route',
        'GET /api/admin/trips/active': 'Get active trips'
      }
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Driver location update
  socket.on('location-update', async (data) => {
    console.log('📍 Location update received:', data);

    try {
      // Store location in database
      const { LocationService } = await import('./services/locationService.js');
      const saveResult = await LocationService.saveLocation({
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp || new Date().toISOString()
      });

      if (saveResult.success) {
        console.log('✅ Location saved to database:', saveResult.data);
      } else {
        console.error('❌ Failed to save location:', saveResult.error);
      }
    } catch (error) {
      console.error('❌ Error saving location:', error);
    }

    // Broadcast to all connected users
    console.log('📡 Broadcasting to', io.engine.clientsCount, 'connected clients');
    io.emit('bus-location-update', data);
    console.log('📡 Broadcast sent:', data);
  });

  // Driver trip status update
  socket.on('trip-status-update', (data) => {
    console.log('Trip status update:', data);
    io.emit('bus-status-update', data);
  });

  // User subscription to specific bus
  socket.on('subscribe-to-bus', (busId) => {
    socket.join(`bus-${busId}`);
    console.log(`User subscribed to bus: ${busId}`);
  });

  // Handle location request from admin panel
  socket.on('request-location', async (data) => {
    console.log('Location request received for trip:', data.tripId);
    try {
      // Get the latest location for this trip
      const { LocationService } = await import('./services/locationService.js');
      const result = await LocationService.getLatestLocation(data.tripId);

      if (result.success && result.data) {
        // Send the latest location back to the requesting client
        socket.emit('location-update', {
          tripId: data.tripId,
          latitude: result.data.latitude,
          longitude: result.data.longitude,
          timestamp: result.data.timestamp,
          accuracy: result.data.accuracy || 50
        });
        console.log('Sent latest location for trip:', data.tripId);
      }
    } catch (error) {
      console.error('Error fetching latest location:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
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

    server.listen(PORT, () => {
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