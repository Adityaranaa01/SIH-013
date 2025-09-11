// backend/src/data/routes.js
// Hardcoded routes in New Delhi

const routes = [
    {
      id: 'route-1',
      name: 'Connaught Place — India Gate Loop',
      description: 'Covers Connaught Place, Janpath, and India Gate',
      coords: [
        { lat: 28.6315, lng: 77.2167 }, // Connaught Place
        { lat: 28.6206, lng: 77.2203 }, // Janpath
        { lat: 28.6129, lng: 77.2295 }, // India Gate
        { lat: 28.6170, lng: 77.2336 }, // National Gallery of Modern Art
        { lat: 28.6261, lng: 77.2255 }  // Back towards CP
      ],
      stops: [
        { id: 'r1-s1', name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
        { id: 'r1-s2', name: 'Janpath Market', lat: 28.6206, lng: 77.2203 },
        { id: 'r1-s3', name: 'India Gate', lat: 28.6129, lng: 77.2295 }
      ]
    },
    {
      id: 'route-2',
      name: 'Kashmiri Gate — Red Fort Route',
      description: 'Runs from Kashmiri Gate ISBT to Red Fort and back',
      coords: [
        { lat: 28.6670, lng: 77.2273 }, // Kashmiri Gate ISBT
        { lat: 28.6562, lng: 77.2410 }, // Chandni Chowk
        { lat: 28.6565, lng: 77.2400 }, // Jama Masjid
        { lat: 28.6562, lng: 77.2410 }, // Chandni Chowk (loop back)
        { lat: 28.6569, lng: 77.2334 }  // Red Fort
      ],
      stops: [
        { id: 'r2-s1', name: 'Kashmiri Gate ISBT', lat: 28.6670, lng: 77.2273 },
        { id: 'r2-s2', name: 'Chandni Chowk', lat: 28.6562, lng: 77.2410 },
        { id: 'r2-s3', name: 'Red Fort', lat: 28.6569, lng: 77.2334 }
      ]
    }
  ];
  
  module.exports = { routes };
  