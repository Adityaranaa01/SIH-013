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

-- Seed minimal sample data (optional)
INSERT INTO drivers (driver_id, name, route_id, status) VALUES 
('D001', 'Rajesh Kumar', '500A', 'inactive'),
('D002', 'Priya Sharma', '600B', 'inactive'),
('D003', 'Suresh Reddy', '700C', 'inactive'),
('D004', 'Anita Singh', '600B', 'inactive'),
('D005', 'Vikram Patel', '600B', 'inactive'),
('D006', 'Deepak Kumar', '700C', 'inactive'),
('D007', 'Sunita Rao', '700C', 'inactive')
ON CONFLICT (driver_id) DO NOTHING;

INSERT INTO buses (bus_number, status) VALUES 
('BUS-001', 'halt'),
('BUS-002', 'halt'),
('BUS-003', 'halt'),
('BUS-004', 'halt'),
('BUS-005', 'halt'),
('BUS-006', 'halt'),
('BUS-007', 'halt')
ON CONFLICT (bus_number) DO NOTHING;
