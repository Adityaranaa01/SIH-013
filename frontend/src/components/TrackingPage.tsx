import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { TrackingAPI } from '../lib/api';

// Lazy-load Leaflet only on client
function useLeaflet() {
  const [L, setL] = useState<any>(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      // Ensure Leaflet CSS is loaded
      const cssId = 'leaflet-css'
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link')
        link.id = cssId
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      const leaflet = await import('leaflet')
      // default icon fix for Vite bundling
      // @ts-ignore
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      if (mounted) setL(leaflet)
    })()
    return () => { mounted = false }
  }, [])
  return L
}

export function TrackingPage() {
  const [activeBuses, setActiveBuses] = useState<Array<{ id: string; plateNumber: string; driver: string | null; assignedRoute: string | null }>>([])
  const [selectedBus, setSelectedBus] = useState<string | null>(null)
  const [positions, setPositions] = useState<Array<{ latitude: number; longitude: number; recorded_at: string }>>([])
  const [since, setSince] = useState<string | undefined>(undefined)
  const L = useLeaflet()
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const polyRef = useRef<any>(null)

  // Fetch active buses every 10s
  useEffect(() => {
    let stop = false
    const tick = async () => {
      try {
        const buses = await TrackingAPI.activeBuses()
        if (stop) return
        setActiveBuses(buses)
        // Keep selected if still present, else clear
        if (selectedBus && !buses.find(b => b.id === selectedBus)) {
          setSelectedBus(null)
          setPositions([])
          setSince(undefined)
        }
      } catch {}
      if (!stop) setTimeout(tick, 10000)
    }
    tick()
    return () => { stop = true }
  }, [selectedBus])

  // Poll positions every 5s for selected bus
  useEffect(() => {
    if (!selectedBus) return
    let stop = false
    const tick = async () => {
      try {
        const res = await TrackingAPI.positions(selectedBus, since)
        if (stop) return
        const newPts = res.positions || []
        if (newPts.length) {
          setPositions(prev => [...prev, ...newPts])
          setSince(newPts[newPts.length - 1].recorded_at)
        }
      } catch {}
      if (!stop) setTimeout(tick, 5000)
    }
    tick()
    return () => { stop = true }
  }, [selectedBus, since])

  // Initialize/update map
  useEffect(() => {
    if (!L) return
    if (!mapRef.current) {
      mapRef.current = L.map('live-map', { center: [12.9716, 77.5946], zoom: 12 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current)
    }
    if (positions.length) {
      const last = positions[positions.length - 1]
      const latlng = [last.latitude, last.longitude] as [number, number]
      if (!markerRef.current) {
        markerRef.current = L.marker(latlng).addTo(mapRef.current)
      } else {
        markerRef.current.setLatLng(latlng)
      }
      if (!polyRef.current) {
        polyRef.current = L.polyline(positions.map(p => [p.latitude, p.longitude]), { color: 'blue' }).addTo(mapRef.current)
      } else {
        polyRef.current.setLatLngs(positions.map(p => [p.latitude, p.longitude]))
      }
      mapRef.current.setView(latlng, mapRef.current.getZoom())
    } else {
      // clear overlays when no positions
      if (polyRef.current) { polyRef.current.remove(); polyRef.current = null }
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
    }
  }, [L, positions])

  return (
    <div className="space-y-6">
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
              {activeBuses.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBus(b.id)
                    setPositions([])
                    setSince(undefined)
                  }}
                  className={`px-3 py-2 rounded-md border ${selectedBus === b.id ? 'border-primary text-primary' : 'border-muted-foreground/20'}`}
                  title={`Route: ${b.assignedRoute || '-'} | Driver: ${b.driver || '-'}`}
                >
                  {b.plateNumber}
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
  )
}