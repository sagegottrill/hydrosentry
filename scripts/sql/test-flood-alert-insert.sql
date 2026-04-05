-- Fire send-flood-alert (≥100 cm). Requires ≥1 row in sensor_nodes.
INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status)
SELECT id,
       105,
       3.7,
       'online'::public.node_status_type
FROM public.sensor_nodes
LIMIT 1;
