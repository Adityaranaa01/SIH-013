// Simple script to simulate location updates for the existing trip
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

// Connect to the backend
const socket = io(BACKEND_URL);

socket.on('connect', () => {
    console.log('✅ Connected to backend');

    // Use the existing trip ID from the API response
    const tripId = 'd6087382-44d0-4c60-a9b9-2e7520e15ea9';
    const busNumber = 'BUS-001';
    const routeId = '500A';

    // Starting coordinates (current location from API)
    let lat = 12.94285703;
    let lng = 77.57376564;

    console.log('🚌 Simulating location updates for existing trip:', tripId);
    console.log('📍 Starting from:', lat, lng);

    // Send location updates every 3 seconds
    const interval = setInterval(() => {
        // Simulate movement along the route (moving towards Electronic City)
        lat += (Math.random() - 0.3) * 0.0005; // Slight southward movement
        lng += (Math.random() - 0.2) * 0.0005; // Slight eastward movement

        const locationData = {
            tripId,
            busNumber,
            routeId,
            routeName: '500A',
            routeDescription: 'Majestic → Electronic City',
            routeColor: '#FF6B6B',
            latitude: lat,
            longitude: lng,
            timestamp: new Date().toISOString(),
            accuracy: Math.random() * 10 + 5 // 5-15 meter accuracy
        };

        console.log('📍 Sending location update:', {
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
            timestamp: locationData.timestamp
        });

        socket.emit('location-update', locationData);
    }, 3000); // Every 3 seconds

    // Stop after 5 minutes
    setTimeout(() => {
        clearInterval(interval);
        console.log('🛑 Stopping location simulation');
        socket.disconnect();
        process.exit(0);
    }, 300000); // 5 minutes
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from backend');
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
});
