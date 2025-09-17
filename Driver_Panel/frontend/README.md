# Driver App Frontend

A React.js frontend application for the Driver App that provides GPS tracking interface, trip management, and driver authentication.

## Features

- **Driver Authentication**: Secure login interface with backend API integration
- **Trip Management**: Start, end, and monitor active trips
- **Real-time GPS Tracking**: Live location tracking with 5-second updates
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **API Integration**: Clean API layer for backend communication
- **Error Handling**: Comprehensive error handling and user feedback
- **Demo Mode**: Fallback functionality when backend is unavailable

## Technology Stack

- **React 19.1.1** - Modern React with hooks
- **Vite 7.1.2** - Fast build tool and dev server
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **React Router Dom 7.9.0** - Client-side routing
- **TypeScript** - Type safety (partially implemented)

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/               # Page components
│   │   ├── Login.jsx       # Driver authentication page
│   │   └── Trip.jsx        # Trip management page
│   ├── services/           # API communication layer
│   │   └── api.js          # Backend API service
│   ├── context/            # React context providers
│   │   └── DriverContext.jsx
│   ├── utils/              # Utility functions
│   │   └── geo.js          # GPS tracking utilities
│   ├── styles/             # Styling files
│   │   └── tailwind.css    # Tailwind imports
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation & Setup

1. Navigate to the frontend directory:
```bash
cd frontend
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

5. Build for production:
```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## API Integration

The frontend communicates with the backend via REST APIs:

```javascript
import { authAPI, tripAPI, locationAPI } from './services/api';

// Authentication
const result = await authAPI.login(driverId, busNumber);

// Trip management
const trip = await tripAPI.startTrip(driverId, busNumber);
await tripAPI.endTrip(tripId);

// Location tracking
await locationAPI.saveLocation(locationData);
```

## Key Features

### Driver Authentication
- Secure login with driver ID and bus number
- Session persistence with localStorage
- Backend validation with fallback to demo mode

### Trip Management
- Start/end trips with database persistence
- Real-time trip status monitoring
- GPS tracking integration

### GPS Tracking
- Browser geolocation API integration
- 5-second location updates during active trips
- Hybrid tracking approach (watchPosition + backup timer)
- Location data sent to backend API

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- PWA-ready structure
- Safe area handling for mobile devices

## Development

The frontend is designed to be:
- **Component-based**: Modular React components
- **State-driven**: React hooks and context for state management
- **API-first**: Clean separation from backend logic
- **Mobile-friendly**: Responsive design with touch support
- **Accessible**: Semantic HTML and keyboard navigation

## Production Deployment

For production deployment:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production
4. Set up HTTPS for geolocation API access
5. Configure proper CORS on backend

## Browser Support

- Modern browsers with ES2015+ support
- Geolocation API support required for GPS tracking
- Local storage support for session persistence

## License

ISC