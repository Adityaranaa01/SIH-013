import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { TrackingAPI } from '../lib/api';

function useLeaflet() {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const cssId = 'leaflet-css';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const leaflet = await import('leaflet');
      // @ts-ignore
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mounted) setL(leaflet);
    })();

    return () => { mounted = false; };
  }, []);

  return L;
}

export function TrackingPage() {
  const [activeBuses, setActiveBuses] = useState<
    Array<{ id: string; plateNumber: string; driver: string | null; assignedRoute: string | null }>
  >([]);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [positions, setPositions] = useState<Array<{ latitude: number; longitude: number; recorded_at: string }>>([]);
  const [since, setSince] = useState<string | undefined>(undefined);

  const L = useLeaflet();
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polyRef = useRef<any>(null);

  // Poll active buses every 10 seconds
  useEffect(() => {
    let stopped = false;

    const pollBuses = async () => {
      try {
        const buses = await TrackingAPI.activeBuses();
        if (stopped) return;

        setActiveBuses(buses);

        // Reset selected bus if it disappeared
        if (selectedBus && !buses.find(b => b.id === selectedBus)) {
          setSelectedBus(null);
          setPositions([]);
          setSince(undefined);
        }
      } catch (err) {
        console.error('Error fetching active buses', err);
      }

      if (!stopped) setTimeout(pollBuses, 10000);
    };

    pollBuses();
    return () => { stopped = true; };
  }, [selectedBus]);

  // Poll positions for selected bus every 5 seconds
  useEffect(() => {
    if (!selectedBus) return;

    let stopped = false;

    const pollPositions = async () => {
      try {
        const res = await TrackingAPI.positions(selectedBus, since);
        if (stopped) return;

        const newPositions = res.positions || [];
        if (newPositions.length) {
          setPositions(prev => [...prev, ...newPositions]);
          setSince(newPositions[newPositions.length - 1].recorded_at);
        }
      } catch (err) {
        console.error('Error fetching positions', err);
      }

      if (!stopped) setTimeout(pollPositions, 5000);
    };

    pollPositions();
    return () => { stopped = true; };
  }, [selectedBus, since]);

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!L) return;

    if (!mapRef.current) {
      mapRef.current = L.map('live-map', { center: [12.9716, 77.5946], zoom: 12 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    if (positions.length) {
      const last = positions[positions.length - 1];
      const latlng: [number, number] = [last.latitude, last.longitude];

      if (!markerRef.current) {
        markerRef.current = L.marker(latlng).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng(latlng);
      }

      if (!polyRef.current) {
        polyRef.current = L.polyline(positions.map(p => [p.latitude, p.longitude]), { color: 'blue' }).addTo(mapRef.current);
      } else {
        polyRef.current.setLatLngs(positions.map(p => [p.latitude, p.longitude]));
      }

      mapRef.current.setView(latlng, mapRef.current.getZoom());
    } else {
      // Remove markers if no positions
      if (polyRef.current) { polyRef.current.remove(); polyRef.current = null; }
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    }
  }, [L, positions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gradient-primary tracking-tight">Tracking</h2>
          <p className="text-lg text-muted-foreground">Active buses and live locations</p>
        </div>
        <Badge className="bg-gradient-primary text-white">Live</Badge>
      </div>

      {/* Active buses list */}
      <Card className="card-elevated border-0">
        <CardContent className="p-4">
          {activeBuses.length === 0 ? (
            <div className="text-muted-foreground">No running buses.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeBuses.map(bus => (
                <button
                  key={bus.id}
                  onClick={() => {
                    setSelectedBus(bus.id);
                    setPositions([]);
                    setSince(undefined);
                  }}
                  className={`px-3 py-2 rounded-md border ${
                    selectedBus === bus.id ? 'border-primary text-primary' : 'border-muted-foreground/20'
                  }`}
                  title={`Route: ${bus.assignedRoute || '-'} | Driver: ${bus.driver || '-'}`}
                >
                  {bus.plateNumber}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="w-full card-elevated border-0">
        <CardContent className="p-0">
          <div id="live-map" className="min-h-[500px] rounded-xl overflow-hidden" />
        </CardContent>
      </Card>
    </div>
  );
}
