// Base API URL (fallback to localhost during development)
const DEFAULT_API_BASE = 'http://localhost:3011';
const RAW_API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;

function resolveApiBase(raw?: string): string {
  const candidate = (raw || '').trim();
  if (!candidate) return DEFAULT_API_BASE;
  // If placeholder-like value leaked into env, ignore it
  if (candidate.includes('<') || candidate.includes('>')) return DEFAULT_API_BASE;
  try {
    // new URL will throw on invalid absolute URLs
    // Allow relative paths like '/api' – treat as same-origin
    if (candidate.startsWith('/')) return candidate;
    // Validate absolute URL
    // eslint-disable-next-line no-new
    new URL(candidate);
    return candidate;
  } catch {
    return DEFAULT_API_BASE;
  }
}

const API_BASE = resolveApiBase(RAW_API_BASE);

type ApiOptions = RequestInit & { cacheTtlMs?: number };

// Simple in-memory cache for GET requests
const requestCache = new Map<
  string,
  { time: number; data: any; promise?: Promise<any> }
>();

/**
 * Core API helper.
 * Handles JSON requests, response parsing, error handling, and optional GET caching.
 */
async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const url = `${API_BASE}${path}`;
  const { cacheTtlMs, headers, ...fetchOptions } = options;

  const shouldCache = method === 'GET';
  const ttl = cacheTtlMs ?? (shouldCache ? 15_000 : 0);

  // Try returning from cache first
  if (shouldCache && ttl > 0) {
    const cached = requestCache.get(url);
    const now = Date.now();

    if (cached && now - cached.time < ttl) {
      return cached.data as T;
    }

    // If a pending request exists, return that promise instead of making a new one
    if (cached?.promise) {
      return cached.promise as Promise<T>;
    }

    // Otherwise, make a new request and store the pending promise in cache
    const pending = (async () => {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        ...fetchOptions,
      });

      if (!res.ok) {
        const message = await res.text().catch(() => '');
        throw new Error(message || res.statusText);
      }

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : (undefined as unknown as T);

      requestCache.set(url, { time: Date.now(), data });
      return data as T;
    })();

    requestCache.set(url, { time: 0, data: undefined, promise: pending });
    return pending;
  }

  // Non-GET requests (no caching)
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    
    ...fetchOptions,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || res.statusText);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  return isJson ? res.json() : (undefined as unknown as T);
}

// ------------------ API WRAPPERS ------------------

// Authentication
export const AuthAPI = {
  login: (adminId: string, password: string) =>
    api<{ id: string; name: string }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ adminId, password }),
    }),

  me: () => api<{ id: string; name: string }>(`/me`),

  logout: () =>
    api<{ ok: boolean }>(`/auth/logout`, {
      method: 'POST',
    }),
};

// Routes
export const RoutesAPI = {
  list: () =>
    api<Array<{ routeId: string; start: string; end: string; name?: string | null; stopsCount: number }>>(`/routes`),

  get: (routeId: string) =>
    api<{
      routeId: string;
      start: string;
      end: string;
      name?: string | null;
      stops: Array<{ stopNumber: number; name: string; lat: number; long: number }>;
    }>(`/routes/${routeId}`),

  create: (payload: {
    routeId: string;
    start: string;
    end: string;
    name?: string | null;
    stops?: any[];
  }) =>
    api(`/routes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (routeId: string, payload: {
    start?: string;
    end?: string;
    name?: string | null;
    isActive?: boolean;
  }) =>
    api(`/routes/${routeId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  replaceStops: (routeId: string, stops: any[]) =>
    api(`/routes/${routeId}/stops`, {
      method: 'PUT',
      body: JSON.stringify({ stops }),
    }),

  remove: (routeId: string) =>
    api(`/routes/${routeId}`, {
      method: 'DELETE',
    }),
};

// Buses
export const BusesAPI = {
  list: () => api<Array<any>>(`/buses`),

  create: (payload: {
    busNumber: string;
    assignedRoute?: string | null;
    driver?: string | null;
    status?: string | null;
  }) =>
    api(`/buses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (busNumber: string, payload: any) =>
    api(`/buses/${busNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// Metrics
export const MetricsAPI = {
  get: () =>
    api<{
      routesCount: number;
      busesCount: number;
      activeBusesCount: number;
      recentRoutes: Array<{
        routeId: string;
        start: string;
        end: string;
        stops: number;
      }>;
    }>(`/metrics`),
};

// Drivers
export const DriversAPI = {
  list: () =>
    api<Array<{ id: string; name: string; phone?: string | null }>>(`/drivers`),

  create: (payload: { id: string; name: string; phone?: string | null }) =>
    api(`/drivers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// Tracking
export const TrackingAPI = {
  activeBuses: () =>
    api<
      Array<{
        id: string;
        plateNumber: string;
        status: string;
        assignedRoute: string | null;
        driver: string | null;
      }>
    >(`/tracking/active-buses`, { cacheTtlMs: 0 }),

  positions: (bus: string, since?: string) =>
    api<{ positions: Array<{ latitude: number; longitude: number; recorded_at: string }> }>(
      `/tracking/positions${
        since
          ? `?bus=${encodeURIComponent(bus)}&since=${encodeURIComponent(since)}`
          : `?bus=${encodeURIComponent(bus)}`
      }`,
      { cacheTtlMs: 0 }
    ),
};
