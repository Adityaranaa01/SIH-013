import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

console.log('Connecting to backend...');
const socket = io(BACKEND_URL);

socket.on('connect', () => {
    console.log('Connected to backend WebSocket');

    const testData = {
        tripId: '37559635-a4f1-4477-b7fc-93f9ccaee6df',
        busNumber: 'BUS-001',
        routeId: '500A',
        latitude: 12.9774,
        longitude: 77.5708,
        timestamp: new Date().toISOString(),
        accuracy: 10
    };

    console.log('Sending test location update:', testData);
    socket.emit('location-update', testData);

    socket.on('bus-location-update', (data) => {
        console.log('Received bus-location-update:', data);
    });

    setTimeout(() => {
        console.log('Disconnecting...');
        socket.disconnect();
        process.exit(0);
    }, 5000);
});

socket.on('disconnect', () => {
    console.log('Disconnected from backend WebSocket');
});

socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    process.exit(1);
});
