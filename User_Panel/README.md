# SmartTransit Real-time Bus Tracking System

A complete real-time bus tracking system with separate user and driver panels connected via WebSocket backend.

## Architecture

```
SIH-013/
├── User_Panel/
│   ├── frontend/          # User panel - React app (Port 3000)
│   ├── start-all.bat      # Windows startup script
│   └── start-all.sh       # Linux/Mac startup script
└── Driver_Panel/
    ├── backend/           # Node.js/Express + Socket.io + Supabase (Port 5000)
    ├── frontend/          # Driver panel - React app (Port 3001)
    └── supabase/          # Database schema and migrations
```

## Features

### Backend (Port 5000)

- **Express.js** server with REST API
- **Socket.IO** for real-time WebSocket communication
- **Supabase** database integration for persistent storage
- **CORS** enabled for cross-origin requests
- **Health check** endpoint at `/health`
- **Database schema** for drivers, buses, trips, and locations

### User Panel (Port 3000)

- Live bus tracking dashboard
- Interactive map with real-time bus locations
- Route information and ETA calculations
- Real-time connection status

### Driver Panel (Port 3001)

- **React** with routing and context management
- **Driver authentication** and registration
- **GPS location tracking** with WebSocket broadcasting
- **Trip management** (start/end trips)
- **Real-time location updates** to user panel
- **Supabase integration** for data persistence

## Quick Start

### Option 1: Start All Services (Recommended)

```bash
# Windows
start-all.bat

# Linux/Mac
chmod +x start-all.sh
./start-all.sh
```

### Option 2: Manual Start

1. **Start Backend Server**

   ```bash
   cd ../Driver_Panel/backend
   npm install
   npm run dev
   ```

2. **Start User Panel**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Start Driver Panel**
   ```bash
   cd ../Driver_Panel/frontend
   npm install
   npm run dev
   ```

## Usage

1. **Open User Panel**: http://localhost:3000

   - View live bus locations
   - Track buses in real-time
   - Check ETAs and routes

2. **Open Driver Panel**: http://localhost:3001

   - Register as a driver
   - Enter bus ID and route
   - Start trip to begin location tracking

3. **Real-time Communication**
   - Driver location updates are sent to backend
   - Backend broadcasts updates to all connected users
   - Users see live bus movements on the map

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/buses` - Get all active buses
- `GET /api/bus/:busId` - Get specific bus data

## WebSocket Events

### Driver Events

- `driver-register` - Register driver and bus
- `location-update` - Send location update
- `start-trip` - Start trip tracking
- `end-trip` - End trip tracking

### User Events

- `subscribe-to-bus` - Subscribe to specific bus updates
- `bus-location-update` - Receive location updates
- `bus-status-update` - Receive status changes

## Development

### Backend Dependencies

- Express.js - Web framework
- Socket.io - WebSocket communication
- CORS - Cross-origin resource sharing
- Helmet - Security headers
- Express Rate Limit - Rate limiting

### Frontend Dependencies

- React 18 - UI framework
- TypeScript - Type safety
- Socket.io-client - WebSocket client
- Leaflet - Interactive maps
- Tailwind CSS - Styling

## Environment Variables

Create `.env` file in backend directory:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DRIVER_PANEL_URL=http://localhost:3001
```

## Troubleshooting

1. **Connection Issues**

   - Ensure all services are running
   - Check firewall settings
   - Verify port availability

2. **Location Not Updating**

   - Check browser location permissions
   - Ensure driver panel is connected
   - Verify WebSocket connection

3. **Build Issues**
   - Run `npm install` in each directory
   - Check Node.js version compatibility
   - Clear npm cache if needed

## Production Deployment

1. Build all frontend applications
2. Set up production environment variables
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure database for persistence

## Team

Smart India Hackathon 2024 Team

- SB, SR, SY, AR, SD, PS
