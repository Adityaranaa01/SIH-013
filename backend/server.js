require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const routeRoutes = require("./src/routes/routes");
const stopRoutes = require("./src/routes/stops");
const locationSocket = require("./src/sockets/locationSocket");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/routes", routeRoutes);
app.use("/api/stops", stopRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Start bus simulator socket
locationSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
