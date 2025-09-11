const { io } = require("socket.io-client");

// Connect to backend
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("✅ Connected to backend:", socket.id);
});

socket.on("busLocation", (buses) => {
  console.clear();
  console.log("🚌 Bus positions:");
  buses.forEach((bus) => {
    console.log(
      `${bus.name} | Route: ${bus.route} | Lat: ${bus.lat.toFixed(
        5
      )} | Lng: ${bus.lng.toFixed(5)} | ETA: ${bus.eta}`
    );
  });
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend");
});
