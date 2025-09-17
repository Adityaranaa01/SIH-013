# Driver App Backend

A Node.js/Express backend API for the Driver App that provides GPS tracking, trip management, and driver authentication services.

## Features

- **Driver Authentication**: Secure login with driver ID and bus number validation
- **Trip Management**: Start, end, and track active trips
- **GPS Location Tracking**: Real-time location data storage and retrieval
- **RESTful API**: Clean REST endpoints for frontend communication
- **Database Integration**: Supabase PostgreSQL integration
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Cross-origin resource sharing for frontend communication

## API Endpoints

### Health Check
- `GET /health` - Check backend service health

### Authentication
- `POST /api/auth/login` - Driver login authentication
- `GET /api/auth/driver/:driverId` - Get driver information

### Trip Management
- `GET /api/trips/active/:driverId` - Get active trip for driver
- `POST /api/trips/start` - Start a new trip
- `POST /api/trips/end` - End an active trip
- `GET /api/trips/:tripId` - Get trip details

### Location Tracking
- `POST /api/locations` - Save GPS location data
- `GET /api/locations/trip/:tripId` - Get location history for trip
- `GET /api/locations/latest/:tripId` - Get latest location for trip
- `GET /api/locations/active` - Get all active trip locations

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

## Installation & Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure your `.env` file (see above)

4. Start the development server:
```bash
npm run dev
```

5. Or start the production server:
```bash
npm start
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## Architecture

```
backend/
├── config/
│   └── database.js      # Supabase configuration
├── middleware/
│   └── errorHandler.js  # Error handling middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── trips.js         # Trip management routes
│   └── locations.js     # Location tracking routes
├── services/
│   ├── driverService.js # Driver business logic
│   ├── tripService.js   # Trip business logic
│   └── locationService.js # Location business logic
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── server.js           # Main server file
```

## Database Schema

The backend uses the following Supabase tables:

- `drivers` - Driver information and credentials
- `trips` - Trip records with start/end times and status
- `bus_locations` - GPS location data points

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Success Responses

All successful API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

## Development

The backend is designed to be:
- **Scalable**: Modular architecture with separate services
- **Maintainable**: Clear separation of concerns
- **Testable**: Service layer abstraction for easy unit testing
- **Secure**: Input validation and error handling
- **Documented**: Comprehensive API documentation

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure production database credentials
3. Set up proper CORS origins
4. Use a process manager like PM2
5. Configure reverse proxy (nginx)
6. Set up SSL certificates

## License

ISC