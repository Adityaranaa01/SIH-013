require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const routesData = require('./src/data/routes');
const locationSocket = require('./src/sockets/locationSocket');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Simple API endpoints (useful for initial frontend rendering)
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));
app.get('/api/routes', (req, res) => res.json({ routes: routesData.routes }));
app.get('/api/routes/:id', (req, res) => {
  const route = routesData.routes.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  return res.json(route);
});

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize your location socket logic (separate file)
locationSocket(io);

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
});
