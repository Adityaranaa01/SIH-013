class Route {
    constructor(id, name, coords = [], stops = []) {
      this.id = id;
      this.name = name;
      this.coords = coords;
      this.stops = stops;
    }
  }
  
  module.exports = Route;
  