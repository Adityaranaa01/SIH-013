// backend/test-client.js
const { io } = require("socket.io-client");
const socket = io("http://localhost:4000/locations");

socket.on("connect", () => console.log("connected", socket.id));
socket.on("initial", (d) => console.log("initial", d));
socket.on("buses", (d) => {
  console.log("buses", d.map(b => `${b.id}@(${b.lat},${b.lng})`));
});
