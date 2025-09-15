const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3011';

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return undefined as unknown as T;
}

export const AuthAPI = {
  login: (adminId: string, password: string) =>
    api<{ id: string; name: string }>(`/auth/login`, { method: 'POST', body: JSON.stringify({ adminId, password }) }),
  me: () => api<{ id: string; name: string }>(`/me`),
  logout: () => api<{ ok: boolean }>(`/auth/logout`, { method: 'POST' }),
};

export const RoutesAPI = {
  list: () => api<Array<{ routeId: string; start: string; end: string; name?: string | null; stopsCount: number }>>(`/routes`),
  get: (routeId: string) => api<{ routeId: string; start: string; end: string; name?: string | null; stops: Array<{ stopNumber: number; name: string; lat: number; long: number }> }>(`/routes/${routeId}`),
  create: (payload: { routeId: string; start: string; end: string; name?: string | null; stops?: any[] }) => api(`/routes`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (routeId: string, payload: { start?: string; end?: string; name?: string | null; isActive?: boolean }) => api(`/routes/${routeId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  replaceStops: (routeId: string, stops: any[]) => api(`/routes/${routeId}/stops`, { method: 'PUT', body: JSON.stringify({ stops }) }),
  remove: (routeId: string) => api(`/routes/${routeId}`, { method: 'DELETE' }),
};

export const BusesAPI = {
  list: () => api<Array<any>>(`/buses`),
  update: (busNumber: string, payload: any) => api(`/buses/${busNumber}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const MetricsAPI = {
  get: () => api<{ routesCount: number; busesCount: number; activeBusesCount: number; recentRoutes: Array<{ routeId: string; start: string; end: string; stops: number }> }>(`/metrics`),
};

// Tracking APIs
export const TrackingAPI = {
  activeBuses: () => api<Array<{ id: string; plateNumber: string; status: string; assignedRoute: string | null; driver: string | null }>>(`/tracking/active-buses`),
  positions: (bus: string, since?: string) => api<{ positions: Array<{ latitude: number; longitude: number; recorded_at: string }> }>(`/tracking/positions${since ? `?bus=${encodeURIComponent(bus)}&since=${encodeURIComponent(since)}` : `?bus=${encodeURIComponent(bus)}`}`),
}
