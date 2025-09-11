const simulator = require("../services/simulator");

function locationSocket(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    simulator.start(io);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = locationSocket;
