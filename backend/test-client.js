// backend/test-client.js
const { io } = require("socket.io-client");

// Change port if your backend uses another
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("busLocation", (data) => {
  console.log("Bus locations:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
