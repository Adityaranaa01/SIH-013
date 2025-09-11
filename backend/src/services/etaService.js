const haversine = require("../utils/haversine");

function getETA(bus, nextStop) {
  const distance = haversine(bus.lat, bus.lng, nextStop.lat, nextStop.lng); // km
  const speed = 20; // km/h for prototype
  const etaMin = Math.round((distance / speed) * 60);
  return `${etaMin} min`;
}

module.exports = { getETA };
