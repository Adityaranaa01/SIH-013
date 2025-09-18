export const busRouteMapping = {
  "BUS-001": {
    busId: "BUS-001",
    routeId: "500A",
    routeName: "500A → Electronic City",
    driverName: "Rajesh Kumar",
    busNumber: "KA01-AB-1234",
    status: "active",
    color: "#FF6B6B",
  },

  "BUS-002": {
    busId: "BUS-002",
    routeId: "700A",
    routeName: "700A → Kempegowda Airport",
    driverName: "Priya Sharma",
    busNumber: "KA01-CD-5678",
    status: "active",
    color: "#45B7D1",
  },

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

export const getBusDetails = (busId: string) => {
  return busRouteMapping[busId as keyof typeof busRouteMapping] || null;
};

export const getBusesForRoute = (routeId: string) => {
  return Object.values(busRouteMapping).filter(
    (bus) => bus.routeId === routeId
  );
};

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
