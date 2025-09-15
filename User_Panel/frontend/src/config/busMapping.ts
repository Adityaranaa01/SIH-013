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
    color: "#1f77b4",
  },
  "BUS-002": {
    busId: "BUS-002",
    routeId: "500A",
    routeName: "500A → Electronic City",
    driverName: "Priya Sharma",
    busNumber: "KA01-CD-5678",
    status: "active",
    color: "#1f77b4",
  },
  "BUS-003": {
    busId: "BUS-003",
    routeId: "500A",
    routeName: "500A → Electronic City",
    driverName: "Suresh Reddy",
    busNumber: "KA01-EF-9012",
    status: "active",
    color: "#1f77b4",
  },

  // Route 600B buses
  "BUS-004": {
    busId: "BUS-004",
    routeId: "600B",
    routeName: "600B → Whitefield",
    driverName: "Anita Singh",
    busNumber: "KA01-GH-3456",
    status: "active",
    color: "#ff7f0e",
  },
  "BUS-005": {
    busId: "BUS-005",
    routeId: "600B",
    routeName: "600B → Whitefield",
    driverName: "Vikram Patel",
    busNumber: "KA01-IJ-7890",
    status: "active",
    color: "#ff7f0e",
  },

  // Route 700C buses
  "BUS-006": {
    busId: "BUS-006",
    routeId: "700C",
    routeName: "700C → Kempegowda Airport",
    driverName: "Deepak Kumar",
    busNumber: "KA01-KL-2468",
    status: "active",
    color: "#2ca02c",
  },
  "BUS-007": {
    busId: "BUS-007",
    routeId: "700C",
    routeName: "700C → Kempegowda Airport",
    driverName: "Sunita Rao",
    busNumber: "KA01-MN-1357",
    status: "active",
    color: "#2ca02c",
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
