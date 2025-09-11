const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const routesApi = require("./src/routes/routes");
const stopsApi = require("./src/routes/stops");
const initLocationSocket = require("./src/sockets/locationSocket");

const app = express();
app.use(cors());
app.use(express.json());

// REST APIs
app.use("/api/routes", routesApi);
app.use("/api/stops", stopsApi);

// Server + socket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

initLocationSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
