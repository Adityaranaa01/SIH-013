class Bus {
    constructor(id, name, routeId, lat, lng) {
      this.id = id;
      this.name = name;
      this.routeId = routeId;
      this.route = routeId; // Added this line for test-client
      this.lat = lat;
      this.lng = lng;
      this.eta = "N/A";
    }
  }
  
  module.exports = Bus;
  