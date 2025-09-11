const Bus = require("../models/Bus");
const { stops } = require("../data/stops");
const { getETA } = require("./etaService");

const updateInterval = parseInt(process.env.BUS_UPDATE_INTERVAL) || 3000;

// Initialize buses
let buses = [
  new Bus(1, "Bus 101", "R1", 30.7333, 76.7794),
  new Bus(2, "Bus 102", "R1", 30.7370, 76.7810),
  new Bus(3, "Bus 201", "R2", 30.9000, 75.8573),
  new Bus(4, "Bus 202", "R2", 30.9120, 75.8460),
  new Bus(5, "Bus 301", "R3", 31.6200, 74.8765),
  new Bus(6, "Bus 302", "R3", 31.8200, 75.2070),
  new Bus(7, "Bus 401", "R4", 30.3380, 76.3860),
  new Bus(8, "Bus 402", "R4", 30.5040, 76.5560)
];

// Track next stop index for each bus
let busNextStopIndex = {
  1: 1, 2: 2, 3: 1, 4: 2, 5: 1, 6: 2, 7: 1, 8: 2
};

function moveBusAlongRoute(bus) {
  const routeStops = stops[bus.routeId];
  const nextStop = routeStops[busNextStopIndex[bus.id]];

  // Linear movement
  const latDiff = (nextStop.lat - bus.lat) * 0.2;
  const lngDiff = (nextStop.lng - bus.lng) * 0.2;
  bus.lat += latDiff;
  bus.lng += lngDiff;

  // Update ETA
  bus.eta = getETA(bus, nextStop);

  // Check if bus is close to next stop
  const distance = Math.sqrt((bus.lat - nextStop.lat) ** 2 + (bus.lng - nextStop.lng) ** 2);
  if (distance < 0.0005) {
    busNextStopIndex[bus.id] = (busNextStopIndex[bus.id] + 1) % routeStops.length;
  }
}

function start(io) {
  setInterval(() => {
    buses.forEach(moveBusAlongRoute);
    io.emit("busLocation", buses); // emits all buses every 3 seconds
  }, updateInterval);
}

module.exports = { start, buses };
