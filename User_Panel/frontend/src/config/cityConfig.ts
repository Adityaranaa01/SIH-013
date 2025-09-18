export const cityConfig = {
  name: "Bengaluru",
  state: "Karnataka",
  country: "India",
  coordinates: {
    center: {
      lat: 12.9716,
      lng: 77.5946,
    },
    bounds: {
      north: 13.2,
      south: 12.7,
      east: 77.8,
      west: 77.4,
    },
  },
  transport: {
    operator: "BMTC",
    operatorName: "Bangalore Metropolitan Transport Corporation",
    routes: {
      "500A": {
        name: "500A",
        description: "Majestic → Electronic City",
        color: "#1f77b4",
        stops: [
          "Majestic Bus Stand",
          "Cubbon Park",
          "MG Road",
          "Banashankari",
          "JP Nagar",
          "Bommanahalli",
          "Hosur Road",
          "Electronic City",
        ],
      },
      "600B": {
        name: "600B",
        description: "Majestic → Whitefield",
        color: "#ff7f0e",
        stops: [
          "Majestic Bus Stand",
          "Cubbon Park",
          "Indiranagar",
          "Koramangala",
          "Marathahalli",
          "Whitefield",
        ],
      },
      "700C": {
        name: "700C",
        description: "Majestic → Kempegowda Airport",
        color: "#2ca02c",
        stops: [
          "Majestic Bus Stand",
          "Cubbon Park",
          "Hebbal",
          "Yelahanka",
          "Kempegowda Airport",
        ],
      },
    },
  },
  landmarks: {
    "Majestic Bus Stand": {
      lat: 12.9774,
      lng: 77.5708,
      type: "transport_hub",
      amenities: ["Bus Terminal", "Metro Station", "Shopping"],
    },
    "Electronic City": {
      lat: 12.8456,
      lng: 77.6603,
      type: "business_district",
      amenities: ["IT Hub", "Offices", "Tech Parks"],
    },
    Whitefield: {
      lat: 12.9698,
      lng: 77.75,
      type: "business_district",
      amenities: ["IT Hub", "Tech Parks", "Residential Area"],
    },
    "Kempegowda Airport": {
      lat: 13.1986,
      lng: 77.7063,
      type: "airport",
      amenities: ["Airport", "Terminal", "Parking"],
    },
    "Cubbon Park": {
      lat: 12.9716,
      lng: 77.5946,
      type: "park",
      amenities: ["Park", "Metro Station"],
    },
  },
  features: {
    realTimeTracking: true,
    routeOptimization: true,
    multiModalIntegration: true,
    accessibilitySupport: true,
  },
};

export default cityConfig;
