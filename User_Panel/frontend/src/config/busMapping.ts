// Bus ID to Route Mapping Configuration
export const busRouteMapping = {
  // Route 500A buses
  "BUS-001": {
    busId: "BUS-001",
    routeId: "500A",
    routeName: "500A → Electronic City",
    driverName: "Rajesh Kumar",
    busNumber: "KA01-AB-1234",
    status: "active",
    color: "#FF6B6B",
  },

  // Route 700A buses
  "BUS-002": {
    busId: "BUS-002",
    routeId: "700A",
    routeName: "700A → Kempegowda Airport",
    driverName: "Priya Sharma",
    busNumber: "KA01-CD-5678",
    status: "active",
    color: "#45B7D1",
  },

  // Route 600B buses
  "BUS-003": {
    busId: "BUS-003",
    routeId: "600B",
    routeName: "600B → Whitefield",
    driverName: "Suresh Reddy",
    busNumber: "KA01-EF-9012",
    status: "active",
    color: "#4ECDC4",
  },
};

// Helper function to get bus details by ID
export const getBusDetails = (busId: string) => {
  return busRouteMapping[busId as keyof typeof busRouteMapping] || null;
};

// Helper function to get all buses for a specific route
export const getBusesForRoute = (routeId: string) => {
  return Object.values(busRouteMapping).filter(
    (bus) => bus.routeId === routeId
  );
};

// Helper function to search buses by partial ID or route
export const searchBuses = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return Object.values(busRouteMapping).filter(
    (bus) =>
      bus.busId.toLowerCase().includes(lowerQuery) ||
      bus.routeName.toLowerCase().includes(lowerQuery) ||
      bus.driverName.toLowerCase().includes(lowerQuery) ||
      bus.busNumber.toLowerCase().includes(lowerQuery)
  );
};

export default busRouteMapping;
