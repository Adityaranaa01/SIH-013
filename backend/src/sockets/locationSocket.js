// backend/src/sockets/locationSocket.js
const { Server } = require("socket.io");

// Simple bus data for simulation
let buses = [
  { id: 1, name: "Bus 101", lat: 28.6139, lng: 77.2090, route: "R1", eta: "5 min" },
  { id: 2, name: "Bus 102", lat: 28.6200, lng: 77.2150, route: "R1", eta: "7 min" }
];

function initLocationSocket(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send initial data
    socket.emit("busLocation", buses);

    // Simulate movement every 3s
    const interval = setInterval(() => {
      buses = buses.map((bus) => {
        // add tiny random movement
        const latOffset = (Math.random() - 0.5) * 0.001;
        const lngOffset = (Math.random() - 0.5) * 0.001;
        return {
          ...bus,
          lat: bus.lat + latOffset,
          lng: bus.lng + lngOffset,
          eta: `${Math.floor(Math.random() * 10) + 1} min`
        };
      });

      io.emit("busLocation", buses);
    }, 3000);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      clearInterval(interval);
    });
  });
}

module.exports = initLocationSocket;
