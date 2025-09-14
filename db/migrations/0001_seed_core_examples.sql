-- Optional seed data for quick UI testing
-- Replace password_hash with a real bcrypt/argon2 hash in non-dev environments

BEGIN;

INSERT INTO admin_users (admin_id, name, password_hash)
VALUES ('admin', 'Admin', '$2b$12$replace_with_real_bcrypt_hash')
ON CONFLICT (admin_id) DO NOTHING;

INSERT INTO routes (route_id, name, start, "end")
VALUES ('R-101', 'Central–Airport', 'Central Station', 'Airport')
ON CONFLICT (route_id) DO NOTHING;

INSERT INTO route_stops (route_id, stop_id, name, latitude, longitude, sequence)
VALUES
  ('R-101', 'R-101-S1', 'Central Station', 12.9716, 77.5946, 1),
  ('R-101', 'R-101-S2', 'City Center',    12.9750, 77.6050, 2),
  ('R-101', 'R-101-S3', 'Airport',        13.1986, 77.7066, 3)
ON CONFLICT DO NOTHING;

COMMIT;
