-- Parent row for FK on telemetry_readings.sensor_node_id → sensor_nodes.id
-- Field-facing asset tag HS-GWOZA-012 (replaces legacy “E2E CLI flood test node” naming).
INSERT INTO public.sensor_nodes (
  public_code,
  name,
  location,
  latitude,
  longitude,
  type,
  signal_strength,
  reading_unit,
  tinyml_status,
  firmware_version,
  installed_date,
  assigned_warden,
  warning_threshold,
  critical_threshold
) VALUES (
  'HS-GWOZA-012',
  'Gwoza Valley Checkpoint',
  'Gwoza Valley',
  11.8311,
  13.1510,
  'water_level'::public.sensor_hardware_type,
  95,
  'cm',
  'normal'::public.tinyml_status_type,
  'v1.2.4',
  '2026-01-22',
  'Abubakar Shehu',
  150,
  80
)
ON CONFLICT (public_code) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  type = EXCLUDED.type,
  signal_strength = EXCLUDED.signal_strength,
  reading_unit = EXCLUDED.reading_unit,
  tinyml_status = EXCLUDED.tinyml_status,
  firmware_version = EXCLUDED.firmware_version,
  installed_date = COALESCE(sensor_nodes.installed_date, EXCLUDED.installed_date),
  assigned_warden = EXCLUDED.assigned_warden,
  warning_threshold = EXCLUDED.warning_threshold,
  critical_threshold = EXCLUDED.critical_threshold
RETURNING id AS sensor_node_id;
