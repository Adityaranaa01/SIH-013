// backend/src/sockets/locationSocket.js
// This module starts a namespace '/locations' and emits bus positions every 3 seconds.
// Buses follow route coords and interpolate between points for smooth-ish movement.

const { routes } = require('../data/routes');

module.exports = function initLocationSocket(io) {
  const nsp = io.of('/locations');

  // Build buses list: two buses per route (configurable)
  const buses = [];
  routes.forEach((route) => {
    for (let i = 0; i < 2; i += 1) {
      buses.push({
        id: `${route.id}-bus-${i + 1}`,
        routeId: route.id,
        segmentIndex: 0, // index of current start coordinate in route.coords
        progress: Math.random() * 0.6, // fraction 0..1 between segmentIndex and next
        stepsPerSegment: 6, // number of ticks between route points (3s * 6 = 18s)
        lastUpdate: Date.now()
      });
    }
  });

  // Helper: compute interpolated position between two coordinates (linear)
  function interpPosition(a, b, t) {
    return {
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t
    };
  }

  // Helper: compute rough heading (bearing) in degrees 0-360
  function computeHeading(a, b) {
    const toRad = x => (x * Math.PI) / 180;
    const toDeg = x => (x * 180) / Math.PI;
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
    return Math.round(brng);
  }

  function getBusPayload(bus) {
    const route = routes.find(r => r.id === bus.routeId);
    if (!route) return null;
    const coords = route.coords;
    const a = coords[bus.segmentIndex];
    const b = coords[(bus.segmentIndex + 1) % coords.length];
    const pos = interpPosition(a, b, bus.progress);
    const heading = computeHeading(a, b);
    return {
      id: bus.id,
      routeId: bus.routeId,
      lat: parseFloat(pos.lat.toFixed(6)),
      lng: parseFloat(pos.lng.toFixed(6)),
      heading,
      timestamp: Date.now()
    };
  }

  // When a client connects, send initial snapshot and log
  nsp.on('connection', (socket) => {
    console.log(`[locations] client connected: ${socket.id}`);
    // initial snapshot
    socket.emit('initial', buses.map(getBusPayload));
    socket.on('disconnect', () => {
      console.log(`[locations] client disconnected: ${socket.id}`);
    });
  });

  // Emit every 3 seconds
  const TICK_MS = 3000;
  setInterval(() => {
    // advance every bus
    buses.forEach((bus) => {
      bus.progress += 1 / bus.stepsPerSegment;
      if (bus.progress >= 1) {
        bus.progress = bus.progress - 1;
        // advance segmentIndex (loop around)
        const route = routes.find(r => r.id === bus.routeId);
        bus.segmentIndex = (bus.segmentIndex + 1) % route.coords.length;
      }
    });

    const payload = buses.map(getBusPayload);
    // emit to all connected clients in namespace
    nsp.emit('buses', payload);
    // For debugging in server logs (comment out in production)
    // console.log('emitted buses', payload);
  }, TICK_MS);
};
