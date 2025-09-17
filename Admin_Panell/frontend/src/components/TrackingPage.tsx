import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrackingAPI } from '../lib/api';
import { io, Socket } from 'socket.io-client';

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
  const currentBus = activeBuses.find(b => b.id === selectedBus) || null;
  const socketRef = useRef<Socket | null>(null);
  // Keep latest positions from socket for all buses
  const latestByBusRef = useRef<Map<string, { lat: number; lng: number; ts: string }>>(new Map());
  const [socketTick, setSocketTick] = useState(0); // force re-render when socket updates

  // Fetch latest location from driver backend as an immediate fallback
  useEffect(() => {
    const fetchLatest = async () => {
      if (!selectedBus) return;
      try {
        const base = (import.meta as any)?.env?.VITE_SOCKET_REST_BASE
          || (import.meta as any)?.env?.VITE_SOCKET_URL
          || 'http://localhost:5000';
        const res = await fetch(`${base}/api/locations/latest-by-bus/${encodeURIComponent(selectedBus)}`);
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const loc = data?.data || data; // support either wrapped or raw
        const lat = Number(loc?.latitude ?? loc?.lat);
        const lng = Number(loc?.longitude ?? loc?.lng);
        const ts = String(loc?.timestamp ?? new Date().toISOString());
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setPositions(prev => [...prev, { latitude: lat, longitude: lng, recorded_at: ts }]);
          setSince(ts);
          const norm = String(selectedBus).trim().toUpperCase();
          latestByBusRef.current.set(norm, { lat, lng, ts });
          setSocketTick(t => t + 1);
        }
      } catch {}
    };
    fetchLatest();
  }, [selectedBus]);

  // Poll active buses every 10 seconds
  useEffect(() => {
    let stopped = false;

    const pollBuses = async () => {
      try {
        const buses = await TrackingAPI.activeBuses();
        if (stopped) return;

        setActiveBuses(buses);

        // Auto-select if nothing selected and exactly one active bus
        if (!selectedBus && buses.length === 1) {
          setSelectedBus(buses[0].id);
          setPositions([]);
          setSince(undefined);
        }

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

  // Real-time socket subscription for immediate updates
  useEffect(() => {

    // Close any previous socket to avoid duplicates
    if (socketRef.current) {
      try { socketRef.current.close(); } catch {}
      socketRef.current = null;
    }

    const SOCKET_URL = (import.meta as any)?.env?.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true });
    socketRef.current = s;

    const normalize = (v: any) => String(v ?? '').trim().toUpperCase();
    const onUpdate = (data: any) => {
      if (!data) return;
      const rawId = data.busNumber ?? data.tripId;
      const incomingBus = normalize(rawId);
      const selected = normalize(selectedBus);
      // Update latest map for any bus
      const lat = Number(data.latitude);
      const lng = Number(data.longitude);
      const ts = data.timestamp ? String(data.timestamp) : new Date().toISOString();
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        latestByBusRef.current.set(incomingBus, { lat, lng, ts });
        setSocketTick(t => t + 1);
      }

      // Auto-select if nothing is selected yet
      if (!selectedBus) {
        // Prefer matching an active bus id; otherwise use the incoming id
        const found = activeBuses.find(b => normalize(b.id) === incomingBus);
        setSelectedBus(found ? found.id : String(rawId ?? ''));
      }
      // If a different bus is selected, only append to positions when it matches
      if (selected && incomingBus !== selected) return;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setPositions(prev => [...prev, { latitude: lat, longitude: lng, recorded_at: ts }]);
        setSince(ts);
      }
    };

    s.on('bus-location-update', onUpdate);

    return () => {
      try { s.off('bus-location-update', onUpdate); s.close(); } catch {}
      socketRef.current = null;
    };
  }, [selectedBus, activeBuses]);

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!L) return;

    if (!mapRef.current) {
      mapRef.current = L.map('live-map', { center: [12.9716, 77.5946], zoom: 12 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Determine latest point: prefer accumulated positions; otherwise socket latest
    const normalize = (v: any) => String(v ?? '').trim().toUpperCase();
    const latestSocket = selectedBus ? latestByBusRef.current.get(normalize(selectedBus)) : undefined;

    if (positions.length || latestSocket) {
      const latlng: [number, number] = positions.length
        ? [positions[positions.length - 1].latitude, positions[positions.length - 1].longitude]
        : [latestSocket!.lat, latestSocket!.lng];

      const icon = L.divIcon({
        className: 'custom-marker-selected',
        html: `<div style="width:16px;height:16px;border-radius:9999px;background:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.35),0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const popupHtml = `<div class="text-sm">
        <p class="font-bold">${currentBus?.plateNumber ?? selectedBus ?? ''}</p>
        <p>${currentBus?.assignedRoute ?? ''}</p>
        ${currentBus?.driver ? `<p class="text-xs mt-1">Driver: ${currentBus.driver}</p>` : ''}
      </div>`;

      if (!markerRef.current) {
        markerRef.current = L.marker(latlng, { icon }).addTo(mapRef.current).bindPopup(popupHtml);
      } else {
        markerRef.current.setLatLng(latlng);
        markerRef.current.setIcon(icon);
        if (markerRef.current.getPopup()) {
          markerRef.current.setPopupContent(popupHtml);
        } else {
          markerRef.current.bindPopup(popupHtml);
        }
      }

      // Only draw polyline when we have a path
      if (positions.length) {
        if (!polyRef.current) {
          polyRef.current = L.polyline(positions.map(p => [p.latitude, p.longitude]), { color: 'blue' }).addTo(mapRef.current);
        } else {
          polyRef.current.setLatLngs(positions.map(p => [p.latitude, p.longitude]));
        }
      }

      mapRef.current.setView(latlng, mapRef.current.getZoom());
    } else {
      // Remove markers if no positions
      if (polyRef.current) { polyRef.current.remove(); polyRef.current = null; }
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    }
  }, [L, positions, socketTick, selectedBus]);

  // Build a combined list of buses from API and any seen via socket
  const combinedBuses = (() => {
    const byId = new Map<string, { id: string; plateNumber: string; driver: string | null; assignedRoute: string | null }>();
    for (const b of activeBuses) byId.set(b.id, b);
    for (const [normId] of latestByBusRef.current) {
      // If not present, add a minimal entry so admin can click it
      if (![...byId.keys()].some(k => k.trim().toUpperCase() === normId)) {
        byId.set(normId, { id: normId, plateNumber: normId, driver: null, assignedRoute: null });
      }
    }
    return Array.from(byId.values());
  })();

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
          <div className="relative">
            <div id="live-map" className="min-h-[500px] rounded-xl overflow-hidden" />

            {/* Live badge */}
            <Badge
              variant="outline"
              className="absolute top-3 right-3 gap-1 bg-card/90 backdrop-blur z-[999]"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" /> Live Tracking
            </Badge>


            {/* Center button */}
            <button
              onClick={() => {
                const normalize = (v: any) => String(v ?? '').trim().toUpperCase();
                const latest = selectedBus ? latestByBusRef.current.get(normalize(selectedBus)) : undefined;
                const ll = positions.length
                  ? [positions[positions.length - 1].latitude, positions[positions.length - 1].longitude] as [number, number]
                  : latest
                    ? [latest.lat, latest.lng] as [number, number]
                    : null;
                if (mapRef.current && ll) {
                  mapRef.current.setView(ll, Math.max(mapRef.current.getZoom(), 14), { animate: true });
                }
              }}
              className="absolute bottom-4 right-4 z-[999] px-3 py-2 rounded-full bg-white/90 dark:bg-slate-900/80 shadow"
              title="Center on bus"
            >
              Center
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
