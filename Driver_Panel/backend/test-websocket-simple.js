// Simple WebSocket test using the built-in WebSocket
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5000');

ws.on('open', function open() {
    console.log('✅ Connected to WebSocket');

    // Send a test location update
    const testData = {
        tripId: '37559635-a4f1-4477-b7fc-93f9ccaee6df',
        busNumber: 'BUS-001',
        routeId: '500A',
        latitude: 12.9774,
        longitude: 77.5708,
        timestamp: new Date().toISOString(),
        accuracy: 10
    };

    console.log('📤 Sending test location update:', testData);
    ws.send(JSON.stringify({
        type: 'location-update',
        data: testData
    }));

    // Disconnect after sending
    setTimeout(() => {
        ws.close();
        process.exit(0);
    }, 2000);
});

ws.on('message', function message(data) {
    console.log('📥 Received:', data.toString());
});

ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err);
    process.exit(1);
});

ws.on('close', function close() {
    console.log('❌ WebSocket closed');
});
