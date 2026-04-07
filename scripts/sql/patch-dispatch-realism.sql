-- One-time patch for existing Supabase projects (run in SQL Editor if seed was applied earlier).
--
-- 1) Gwoza / E2E: If HS-GWOZA-012 already exists (e.g. from e2e-02-insert-node.sql), DO NOT set a
--    second row to the same public_code. Repoint telemetry from legacy e2e-cli-* rows to the
--    canonical node, then delete the duplicates. If no canonical exists, rename one legacy row.
-- 2) Jere SN-005: ultrasonic clearance thresholds + LiFePO₄ online voltage.
-- 3) Retire Monguno SN-009; align Gwoza HS-GWOZA-012 clearance floors.

-- ---------------------------------------------------------------------------
-- 1a) Canonical already present: merge legacy E2E rows into it
-- ---------------------------------------------------------------------------
UPDATE public.telemetry_readings tr
SET sensor_node_id = c.id
FROM public.sensor_nodes AS c,
     public.sensor_nodes AS leg
WHERE c.public_code = 'HS-GWOZA-012'
  AND leg.id = tr.sensor_node_id
  AND (leg.public_code ILIKE 'e2e-cli-%' OR leg.name = 'E2E CLI flood test node')
  AND leg.id IS DISTINCT FROM c.id;

DELETE FROM public.sensor_nodes sn
WHERE (sn.public_code ILIKE 'e2e-cli-%' OR sn.name = 'E2E CLI flood test node')
  AND sn.public_code IS DISTINCT FROM 'HS-GWOZA-012';

-- ---------------------------------------------------------------------------
-- 1b) No HS-GWOZA-012 yet: promote one legacy row (safe — no duplicate key)
-- ---------------------------------------------------------------------------
UPDATE public.sensor_nodes
SET
  public_code = 'HS-GWOZA-012',
  name = 'Gwoza Valley Checkpoint',
  location = 'Gwoza Valley',
  firmware_version = COALESCE(NULLIF(firmware_version, 'v0.0.1'), 'v1.2.4'),
  assigned_warden = CASE WHEN assigned_warden = 'cli-e2e' THEN 'Abubakar Shehu' ELSE assigned_warden END
WHERE id = (
  SELECT sn.id
  FROM public.sensor_nodes sn
  WHERE (sn.public_code ILIKE 'e2e-cli-%' OR sn.name = 'E2E CLI flood test node')
    AND NOT EXISTS (SELECT 1 FROM public.sensor_nodes c WHERE c.public_code = 'HS-GWOZA-012')
  ORDER BY sn.created_at ASC NULLS LAST
  LIMIT 1
);

-- Ensure canonical row has field-facing labels even if it was created only via INSERT ON CONFLICT
UPDATE public.sensor_nodes
SET
  name = 'Gwoza Valley Checkpoint',
  location = 'Gwoza Valley',
  assigned_warden = CASE WHEN assigned_warden IN ('cli-e2e', '') OR assigned_warden IS NULL THEN 'Abubakar Shehu' ELSE assigned_warden END
WHERE public_code = 'HS-GWOZA-012';

-- ---------------------------------------------------------------------------
-- 2) Jere SN-005
-- ---------------------------------------------------------------------------
UPDATE public.sensor_nodes
SET
  type = 'water_level'::public.sensor_hardware_type,
  reading_unit = 'cm',
  warning_threshold = 150,
  critical_threshold = 80
WHERE public_code = 'SN-005'
  AND name = 'Jere LGA Rain Station';

UPDATE public.telemetry_readings tr
SET
  water_level_cm = 215.40,
  battery_voltage = 3.30,
  node_status = 'online'::public.node_status_type,
  scalar_reading = NULL
WHERE tr.id = (
  SELECT t2.id
  FROM public.telemetry_readings t2
  INNER JOIN public.sensor_nodes sn ON t2.sensor_node_id = sn.id
  WHERE sn.public_code = 'SN-005'
  ORDER BY t2.recorded_at DESC
  LIMIT 1
);

-- ---------------------------------------------------------------------------
-- 3) Retire Monguno SN-009 (10-node pilot)
-- ---------------------------------------------------------------------------
DELETE FROM public.telemetry_readings tr
USING public.sensor_nodes sn
WHERE tr.sensor_node_id = sn.id AND sn.public_code = 'SN-009';

DELETE FROM public.sensor_nodes WHERE public_code = 'SN-009';

UPDATE public.sensor_nodes
SET warning_threshold = 150, critical_threshold = 80
WHERE public_code = 'HS-GWOZA-012';
