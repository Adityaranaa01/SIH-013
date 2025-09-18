-- Driver App Database Schema (Reworked for Driver-Side Focus)
-- Fresh schema for new setups. For existing databases, apply the migration in supabase/sql/migrations/20250913_schema_rework.sql

-- Enable extensions (uuid if needed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    route_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive','active','on_trip')),
    current_bus VARCHAR(50) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    bus_number VARCHAR(50) PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'halt' CHECK (status IN ('halt','assigned','running')),
    current_driver VARCHAR(50) NULL REFERENCES drivers(driver_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    trip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(50) NOT NULL REFERENCES drivers(driver_id) ON DELETE CASCADE,
    bus_number VARCHAR(50) NOT NULL REFERENCES buses(bus_number) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trip locations table
CREATE TABLE IF NOT EXISTS trip_locations (
    location_id BIGSERIAL PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);
CREATE INDEX IF NOT EXISTS idx_trips_driver_status ON trips(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_bus ON trips(bus_number);
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip_time ON trip_locations(trip_id, timestamp DESC);

-- Triggers to maintain updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_buses_updated_at ON buses;
CREATE TRIGGER update_buses_updated_at 
    BEFORE UPDATE ON buses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (development-friendly; tighten for production)
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_locations ENABLE ROW LEVEL SECURITY;

-- Dev policies (open)
-- Drivers policies
DROP POLICY IF EXISTS "drivers_select_all" ON drivers;
CREATE POLICY "drivers_select_all" ON drivers FOR SELECT USING (true);
DROP POLICY IF EXISTS "drivers_insert_all" ON drivers;
CREATE POLICY "drivers_insert_all" ON drivers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "drivers_update_all" ON drivers;
CREATE POLICY "drivers_update_all" ON drivers FOR UPDATE USING (true);

-- Buses policies
DROP POLICY IF EXISTS "buses_select_all" ON buses;
CREATE POLICY "buses_select_all" ON buses FOR SELECT USING (true);
DROP POLICY IF EXISTS "buses_insert_all" ON buses;
CREATE POLICY "buses_insert_all" ON buses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "buses_update_all" ON buses;
CREATE POLICY "buses_update_all" ON buses FOR UPDATE USING (true);

-- Trips policies
DROP POLICY IF EXISTS "trips_select_all" ON trips;
CREATE POLICY "trips_select_all" ON trips FOR SELECT USING (true);
DROP POLICY IF EXISTS "trips_insert_all" ON trips;
CREATE POLICY "trips_insert_all" ON trips FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "trips_update_all" ON trips;
CREATE POLICY "trips_update_all" ON trips FOR UPDATE USING (true);

-- Trip locations policies
DROP POLICY IF EXISTS "trip_locations_select_all" ON trip_locations;
CREATE POLICY "trip_locations_select_all" ON trip_locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "trip_locations_insert_all" ON trip_locations;
CREATE POLICY "trip_locations_insert_all" ON trip_locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "trip_locations_update_all" ON trip_locations;
CREATE POLICY "trip_locations_update_all" ON trip_locations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "trip_locations_delete_all" ON trip_locations;
CREATE POLICY "trip_locations_delete_all" ON trip_locations FOR DELETE USING (true);

-- Routes table for BMTC routes
CREATE TABLE IF NOT EXISTS routes (
    route_id VARCHAR(50) PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#1f77b4',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Route stops table for detailed stop management
CREATE TABLE IF NOT EXISTS route_stops (
    stop_id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INTEGER NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_major_stop BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update drivers table to include assigned route
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS assigned_route VARCHAR(50) REFERENCES routes(route_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_routes_active ON routes(is_active);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_order ON route_stops(route_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_drivers_assigned_route ON drivers(assigned_route);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at 
    BEFORE UPDATE ON routes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for new tables
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Dev policies (open)
DROP POLICY IF EXISTS "routes_select_all" ON routes;
CREATE POLICY "routes_select_all" ON routes FOR SELECT USING (true);
DROP POLICY IF EXISTS "routes_insert_all" ON routes;
CREATE POLICY "routes_insert_all" ON routes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "routes_update_all" ON routes;
CREATE POLICY "routes_update_all" ON routes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "route_stops_select_all" ON route_stops;
CREATE POLICY "route_stops_select_all" ON route_stops FOR SELECT USING (true);
DROP POLICY IF EXISTS "route_stops_insert_all" ON route_stops;
CREATE POLICY "route_stops_insert_all" ON route_stops FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "route_stops_update_all" ON route_stops;
CREATE POLICY "route_stops_update_all" ON route_stops FOR UPDATE USING (true);
DROP POLICY IF EXISTS "route_stops_delete_all" ON route_stops;
CREATE POLICY "route_stops_delete_all" ON route_stops FOR DELETE USING (true);

DROP POLICY IF EXISTS "admin_users_select_all" ON admin_users;
CREATE POLICY "admin_users_select_all" ON admin_users FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_users_insert_all" ON admin_users;
CREATE POLICY "admin_users_insert_all" ON admin_users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "admin_users_update_all" ON admin_users;
CREATE POLICY "admin_users_update_all" ON admin_users FOR UPDATE USING (true);

-- Insert 3 real Bangalore BMTC routes for prototype
INSERT INTO routes (route_id, route_name, description, color, is_active) VALUES 
('500A', '500A', 'Majestic → Electronic City', '#FF6B6B', true),
('600B', '600B', 'Whitefield → Majestic', '#4ECDC4', true),
('700A', '700A', 'Majestic → Kempegowda Airport', '#45B7D1', true)
ON CONFLICT (route_id) DO NOTHING;

-- Insert real Bangalore stops for the 3 routes
INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude, is_major_stop) VALUES 
-- Route 500A: Majestic → Electronic City (Real BMTC Route)
('500A', 'Majestic Bus Stand', 1, 12.9774, 77.5708, true),
('500A', 'Cubbon Park', 2, 12.9716, 77.5946, true),
('500A', 'MG Road', 3, 12.9716, 77.5946, true),
('500A', 'Banashankari', 4, 12.9254, 77.5671, true),
('500A', 'JP Nagar', 5, 12.9076, 77.5852, true),
('500A', 'Bommanahalli', 6, 12.8994, 77.6184, true),
('500A', 'Hosur Road', 7, 12.8456, 77.6603, true),
('500A', 'Electronic City', 8, 12.8456, 77.6603, true),

-- Route 600B: Whitefield → Majestic (Real BMTC Route)
('600B', 'Whitefield', 1, 12.9698, 77.75, true),
('600B', 'Marathahalli', 2, 12.9698, 77.75, true),
('600B', 'Koramangala', 3, 12.9352, 77.6245, true),
('600B', 'Indiranagar', 4, 12.9716, 77.6406, true),
('600B', 'Cubbon Park', 5, 12.9716, 77.5946, true),
('600B', 'Majestic Bus Stand', 6, 12.9774, 77.5708, true),

-- Route 700A: Majestic → Kempegowda Airport (Real BMTC Route)
('700A', 'Majestic Bus Stand', 1, 12.9774, 77.5708, true),
('700A', 'Cubbon Park', 2, 12.9716, 77.5946, true),
('700A', 'Hebbal', 3, 13.0507, 77.5908, true),
('700A', 'Yelahanka', 4, 13.1007, 77.5963, true),
('700A', 'Kempegowda Airport', 5, 13.1986, 77.7063, true)
ON CONFLICT DO NOTHING;

-- Update existing drivers with assigned routes (only 3 routes for prototype)
UPDATE drivers SET assigned_route = '500A' WHERE driver_id = 'D001';
UPDATE drivers SET assigned_route = '600B' WHERE driver_id = 'D002';
UPDATE drivers SET assigned_route = '700A' WHERE driver_id = 'D003';

-- Insert admin user (password: admin123)
-- Using a simple approach for demo - in production, use proper bcrypt hashing
INSERT INTO admin_users (admin_id, username, password_hash, role) VALUES 
('ADMIN001', 'admin', 'admin123', 'admin')
ON CONFLICT (admin_id) DO NOTHING;

-- Seed minimal sample data for prototype (3 drivers)
INSERT INTO drivers (driver_id, name, route_id, status) VALUES 
('D001', 'Rajesh Kumar', '500A', 'inactive'),
('D002', 'Priya Sharma', '600B', 'inactive'),
('D003', 'Suresh Reddy', '700A', 'inactive')
ON CONFLICT (driver_id) DO NOTHING;

INSERT INTO buses (bus_number, status) VALUES 
('BUS-001', 'halt'),
('BUS-002', 'halt'),
('BUS-003', 'halt')
ON CONFLICT (bus_number) DO NOTHING;
