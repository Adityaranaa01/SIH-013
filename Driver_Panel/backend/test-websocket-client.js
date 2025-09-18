// Test WebSocket client to see what data is being broadcast
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

// Connect to the backend
const socket = io(BACKEND_URL);

socket.on('connect', () => {
    console.log('✅ Connected to backend as user panel');

    // Listen for bus location updates
    socket.on('bus-location-update', (data) => {
        console.log('📍 Received bus-location-update:', data);
    });

    // Listen for any other events
    socket.on('location-update', (data) => {
        console.log('📍 Received location-update:', data);
    });

    console.log('👂 Listening for location updates...');
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from backend');
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
});

// Keep the script running
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping WebSocket test client');
    socket.disconnect();
    process.exit(0);
});
