# Driver App - Full-Stack GPS Tracking Application

A complete full-stack application for real-time driver and bus tracking with GPS location monitoring.

## Architecture

This project follows a **separated backend/frontend architecture**:

```
driver-app/
├── frontend/               # React.js frontend application
│   ├── src/               # React components and logic
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend documentation
├── backend/               # Node.js/Express backend API
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── config/            # Database configuration
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── supabase/              # Database schema and migrations
│   └── sql/schema.sql     # Database structure
└── README.md              # This file
```

## Features

### Core Functionality
- **Driver Authentication**: Secure login with database validation
- **Trip Management**: Start, monitor, and end trips
- **Real-time GPS Tracking**: Location updates every 5 seconds
- **Database Integration**: PostgreSQL via Supabase
- **RESTful API**: Clean API architecture
- **Responsive Design**: Mobile-first interface

### Technical Features
- **Separated Architecture**: Independent frontend and backend
- **API-First Design**: RESTful endpoints for all operations
- **Real-time Updates**: Live GPS coordinate streaming
- **Error Handling**: Comprehensive error management
- **Demo Mode**: Fallback when backend unavailable
- **Security**: Environment-based configuration

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional for demo)

### 1. Clone Repository
```bash
git clone <repository-url>
cd driver-app
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev           # Starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment  
npm run dev           # Starts on http://localhost:3000
```

### 4. Setup Database (Optional)
```bash
# Run the schema in your Supabase project
psql -f supabase/sql/schema.sql
```

## Environment Configuration

### Backend (.env)
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Driver authentication
- `GET /api/auth/driver/:id` - Get driver details

### Trip Management
- `GET /api/trips/active/:driverId` - Get active trip
- `POST /api/trips/start` - Start new trip
- `POST /api/trips/end` - End active trip

### Location Tracking
- `POST /api/locations` - Save GPS location
- `GET /api/locations/trip/:tripId` - Get trip history
- `GET /api/locations/active` - Get all active locations

## Technology Stack

### Frontend
- React 19.1.1 with hooks
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation

### Backend  
- Node.js with Express
- Supabase (PostgreSQL)
- CORS and security middleware
- RESTful API design

### Database
- PostgreSQL via Supabase
- Row Level Security (RLS)
- Real-time subscriptions ready

## Development

### Running Both Services
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Project Structure
- **Monorepo**: Both frontend and backend in same repository
- **Independent**: Each service has its own dependencies
- **API-First**: Clean separation via REST API
- **Scalable**: Backend can serve multiple frontends

## Production Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or similar
- Set production environment variables
- Configure database connection
- Enable CORS for frontend domain

### Frontend Deployment
- Build with `npm run build`
- Deploy to Vercel, Netlify, or similar
- Configure API_BASE_URL for production
- Enable HTTPS for geolocation

## Database Schema

### Tables
- **drivers**: Driver credentials and information
- **trips**: Trip records with start/end times
- **bus_locations**: GPS coordinate history

### Key Features
- UUID primary keys
- Timestamp tracking
- Foreign key relationships
- Optimized indexes for queries

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

ISC

## Support

For issues and questions:
1. Check the individual README files in `frontend/` and `backend/`
2. Review the API documentation at `/api`
3. Check database schema in `supabase/sql/schema.sql`
