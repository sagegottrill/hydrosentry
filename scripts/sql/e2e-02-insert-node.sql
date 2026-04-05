-- Dummy parent row for FK on telemetry_readings.sensor_node_id → sensor_nodes.id
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
  assigned_warden,
  warning_threshold,
  critical_threshold
) VALUES (
  'e2e-cli-' || substr(md5(random()::text), 1, 12),
  'E2E CLI flood test node',
  'Automated CLI seed',
  11.8311,
  13.1510,
  'water_level'::public.sensor_hardware_type,
  95,
  'cm',
  'normal'::public.tinyml_status_type,
  'v0.0.1',
  'cli-e2e',
  50,
  150
)
RETURNING id AS sensor_node_id;
