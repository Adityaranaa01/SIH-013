// Simple test to send a WebSocket message
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

// Connect to the backend
const socket = io(BACKEND_URL);

socket.on('connect', () => {
    console.log('✅ Connected to backend');

    // Send a test location update
    const testData = {
        tripId: 'd6087382-44d0-4c60-a9b9-2e7520e15ea9',
        busNumber: 'BUS-001',
        routeId: '500A',
        latitude: 12.9774,
        longitude: 77.5708,
        timestamp: new Date().toISOString(),
        accuracy: 10
    };

    console.log('📤 Sending test location update:', testData);
    socket.emit('location-update', testData);

    // Disconnect after sending
    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 2000);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from backend');
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
});
