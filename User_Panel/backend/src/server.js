const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: [process.env.FRONTEND_URL, process.env.DRIVER_PANEL_URL],
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DRIVER_PANEL_URL]
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Store active connections
const activeDrivers = new Map();
const activeUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Driver registration
    socket.on('driver-register', (data) => {
        const { driverId, busId, route } = data;
        activeDrivers.set(socket.id, {
            driverId,
            busId,
            route,
            socketId: socket.id,
            lastLocation: null,
            isActive: true
        });

        console.log(`Driver registered: ${driverId} (Bus: ${busId})`);
        socket.emit('driver-registered', { success: true, driverId, busId });

        // Notify all users about new active bus
        io.emit('bus-status-update', {
            busId,
            driverId,
            route,
            status: 'active',
            timestamp: new Date().toISOString()
        });
    });

    // Driver location update
    socket.on('location-update', (data) => {
        const driver = activeDrivers.get(socket.id);
        if (driver) {
            driver.lastLocation = {
                lat: data.latitude,
                lng: data.longitude,
                timestamp: new Date().toISOString(),
                accuracy: data.accuracy
            };

            // Broadcast location to all connected users
            io.emit('bus-location-update', {
                busId: driver.busId,
                driverId: driver.driverId,
                route: driver.route,
                location: driver.lastLocation
            });

            console.log(`Location update from ${driver.driverId}: ${data.latitude}, ${data.longitude}`);
        }
    });

    // User subscription to specific bus
    socket.on('subscribe-to-bus', (busId) => {
        activeUsers.set(socket.id, { busId, socketId: socket.id });
        socket.join(`bus-${busId}`);
        console.log(`User subscribed to bus: ${busId}`);
    });

    // Driver trip control
    socket.on('start-trip', (data) => {
        const driver = activeDrivers.get(socket.id);
        if (driver) {
            driver.isActive = true;
            io.emit('trip-started', {
                busId: driver.busId,
                driverId: driver.driverId,
                route: driver.route,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('end-trip', (data) => {
        const driver = activeDrivers.get(socket.id);
        if (driver) {
            driver.isActive = false;
            io.emit('trip-ended', {
                busId: driver.busId,
                driverId: driver.driverId,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const driver = activeDrivers.get(socket.id);
        const user = activeUsers.get(socket.id);

        if (driver) {
            console.log(`Driver disconnected: ${driver.driverId}`);
            activeDrivers.delete(socket.id);

            // Notify users that bus is offline
            io.emit('bus-status-update', {
                busId: driver.busId,
                driverId: driver.driverId,
                status: 'offline',
                timestamp: new Date().toISOString()
            });
        }

        if (user) {
            console.log(`User disconnected: ${user.busId}`);
            activeUsers.delete(socket.id);
        }
    });
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        activeDrivers: activeDrivers.size,
        activeUsers: activeUsers.size
    });
});

app.get('/api/buses', (req, res) => {
    const buses = Array.from(activeDrivers.values()).map(driver => ({
        busId: driver.busId,
        driverId: driver.driverId,
        route: driver.route,
        isActive: driver.isActive,
        lastLocation: driver.lastLocation,
        lastUpdate: driver.lastLocation?.timestamp
    }));

    res.json(buses);
});

app.get('/api/bus/:busId', (req, res) => {
    const { busId } = req.params;
    const driver = Array.from(activeDrivers.values()).find(d => d.busId === busId);

    if (driver) {
        res.json({
            busId: driver.busId,
            driverId: driver.driverId,
            route: driver.route,
            isActive: driver.isActive,
            lastLocation: driver.lastLocation
        });
    } else {
        res.status(404).json({ error: 'Bus not found' });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚌 SmartTransit Backend running on port ${PORT}`);
    console.log(`📡 WebSocket server ready for real-time communication`);
});
