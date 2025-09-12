-- Driver App Database Schema
-- This file contains the database schema for the driver app with tables for drivers, trips, and bus locations

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    bus_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    route_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    trip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id VARCHAR(50) NOT NULL,
    bus_number VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Create bus_locations table
CREATE TABLE IF NOT EXISTS bus_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    bus_number VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time);
CREATE INDEX IF NOT EXISTS idx_bus_locations_trip_id ON bus_locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_driver_id ON bus_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_bus_locations_timestamp ON bus_locations(timestamp);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to drivers table
CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to trips table
CREATE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data for sample driver
INSERT INTO drivers (driver_id, bus_number, name, route_id) 
VALUES ('D001', 'BUS101', 'Sample Driver', 'R001')
ON CONFLICT (driver_id) DO NOTHING;

-- Insert sample trip for the driver
INSERT INTO trips (driver_id, bus_number, start_time, status) 
VALUES ('D001', 'BUS101', CURRENT_TIMESTAMP, 'pending')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) for security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (modified for development - allows public access)
CREATE POLICY "Enable read access for all users" ON drivers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON trips FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON bus_locations FOR SELECT USING (true);

-- Create policies for insert/update (temporarily allow public access for development)
CREATE POLICY "Enable insert for all users" ON drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON drivers FOR UPDATE USING (true);

CREATE POLICY "Enable insert for all users" ON trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON trips FOR UPDATE USING (true);

CREATE POLICY "Enable insert for all users" ON bus_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON bus_locations FOR UPDATE USING (true);