-- =============================================================================
-- HydroSentry — seed data (run AFTER supabase_schema.sql)
-- Execute in Supabase SQL Editor (uses owner privileges; bypasses RLS).
--
-- Stable UUIDs ↔ public_code so gateways and REST examples stay copy-pasteable.
--
-- "Live" UI: Postgres stores one row per reading. Gateways should POST new rows
-- on a cadence (e.g. every 10–60s). The app refetches on each INSERT (Realtime)
-- and every ~5s (poll fallback). Static seed data alone will not drift until you
-- insert more telemetry.
--
-- Local / demo without hardware: in `.env` set VITE_SIMULATE_TELEMETRY=true
-- (the SPA will INSERT drifted readings every few seconds; do not ship that to
-- production long-term — it will grow `telemetry_readings`).
-- =============================================================================

  -- -----------------------------------------------------------------------------
  -- Gateway REST (PostgREST) — insert one telemetry row with anon key
  -- -----------------------------------------------------------------------------
  -- URL:    POST https://<PROJECT_REF>.supabase.co/rest/v1/telemetry_readings
  -- Headers:
  --   apikey: <SUPABASE_ANON_KEY>
  --   Authorization: Bearer <SUPABASE_ANON_KEY>
  --   Content-Type: application/json
  --   Prefer: return=minimal
  -- Body (scalar_reading may be null or omitted):
  --   {
  --     "sensor_node_id": "eeeeeeee-0000-4000-8000-000000000001",
  --     "water_level_cm": 228,
  --     "battery_voltage": 3.18,
  --     "node_status": "online",
  --     "scalar_reading": null
  --   }
  --
  -- curl (replace ANON_KEY):
  --   curl -sS -X POST 'https://rnrxexjoyvjzshfnvtzy.supabase.co/rest/v1/telemetry_readings' \
  --     -H "apikey: ANON_KEY" \
  --     -H "Authorization: Bearer ANON_KEY" \
  --     -H "Content-Type: application/json" \
  --     -H "Prefer: return=minimal" \
  --     -d '{"sensor_node_id":"eeeeeeee-0000-4000-8000-000000000001","water_level_cm":228,"battery_voltage":3.18,"node_status":"online","scalar_reading":null}'
  --
  -- PowerShell:
  --   $h = @{ apikey = "ANON_KEY"; Authorization = "Bearer ANON_KEY"; "Content-Type" = "application/json"; Prefer = "return=minimal" }
  --   $b = '{"sensor_node_id":"eeeeeeee-0000-4000-8000-000000000001","water_level_cm":0,"battery_voltage":3.15,"node_status":"online","scalar_reading":12.4}'
  --   Invoke-RestMethod -Method Post -Uri "https://rnrxexjoyvjzshfnvtzy.supabase.co/rest/v1/telemetry_readings" -Headers $h -Body $b
  -- -----------------------------------------------------------------------------

  -- Optional: wipe prior sample telemetry only (keeps nodes). Use before re-running
  -- the INSERT blocks below or you will duplicate history rows.
  -- TRUNCATE public.telemetry_readings;

  INSERT INTO public.sensor_nodes (
    id,
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
  )
  VALUES
    (
      'eeeeeeee-0000-4000-8000-000000000001'::uuid,
      'SN-001',
      'Ngadda Bridge Alpha',
      'Monday Market Bridge',
      11.8456,
      13.1523,
      'water_level',
      92,
      'cm',
      'normal',
      'v1.2.4',
      '2026-01-15',
      'Ibrahim Musa',
      300,
      400
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000002'::uuid,
      'SN-002',
      'Gwange Drainage Sensor',
      'Gwange Ward',
      11.838,
      13.14,
      'water_level',
      78,
      'cm',
      'normal',
      'v1.2.4',
      '2026-01-18',
      'Aisha Bukar',
      280,
      380
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000003'::uuid,
      'SN-003',
      'Lagos Street Node',
      'Lagos Street',
      11.852,
      13.135,
      'water_level',
      95,
      'cm',
      'normal',
      'v1.2.4',
      '2026-01-20',
      'Mohammed Yusuf',
      250,
      350
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000004'::uuid,
      'SN-004',
      'Alau Dam Monitor',
      'Alau Dam Spillway',
      11.78,
      13.25,
      'water_level',
      85,
      'cm',
      'normal',
      'v1.2.4',
      '2026-01-10',
      'Fatima Ali',
      340,
      400
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000005'::uuid,
      'SN-005',
      'Jere LGA Rain Station',
      'Jere LGA',
      11.88,
      13.1,
      'rain_gauge',
      70,
      'mm/h',
      'normal',
      'v1.1.8',
      '2026-02-01',
      'Usman Babagana',
      25,
      40
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000006'::uuid,
      'SN-006',
      'Konduga Flow Meter',
      'Konduga',
      11.65,
      13.38,
      'flow_meter',
      88,
      'm³/s',
      'normal',
      'v1.2.4',
      '2026-01-25',
      'Halima Suleiman',
      2.0,
      3.5
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000007'::uuid,
      'SN-007',
      'Dikwa Observation Post',
      'Dikwa',
      12.03,
      13.92,
      'water_level',
      62,
      'cm',
      'normal',
      'v1.1.8',
      '2026-02-05',
      'Abdullahi Mala',
      280,
      380
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000008'::uuid,
      'SN-008',
      'Bama North Sensor',
      'Bama LGA',
      11.522,
      13.689,
      'water_level',
      41,
      'cm',
      'normal',
      'v1.1.8',
      '2026-02-10',
      'Zainab Kyari',
      320,
      420
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000009'::uuid,
      'SN-009',
      'Monguno Water Station',
      'Monguno',
      12.68,
      13.61,
      'water_level',
      74,
      'cm',
      'normal',
      'v1.2.4',
      '2026-02-15',
      'Garba Umar',
      250,
      350
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000010'::uuid,
      'SN-010',
      'Marte Relay Node',
      'Marte LGA',
      12.36,
      13.83,
      'water_level',
      0,
      'cm',
      'normal',
      'v1.1.8',
      '2026-02-20',
      'Amina Lawan',
      280,
      380
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
    installed_date = EXCLUDED.installed_date,
    assigned_warden = EXCLUDED.assigned_warden,
    warning_threshold = EXCLUDED.warning_threshold,
    critical_threshold = EXCLUDED.critical_threshold;

  -- -----------------------------------------------------------------------------
  -- Sample telemetry (references UUIDs above). Adds history for chart queries.
  -- -----------------------------------------------------------------------------

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000001'::uuid,
    215 + (g * 0.6)::double precision,
    3.18,
    'online'::public.node_status_type,
    NULL::double precision,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000002'::uuid,
    170 + (g * 0.5)::double precision,
    3.14,
    'online',
    NULL,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000003'::uuid,
    110 + (g * 0.35)::double precision,
    3.2,
    'online',
    NULL,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000004'::uuid,
    280 + (g * 1.4)::double precision,
    3.12,
    'online',
    NULL,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  VALUES
    (
      'eeeeeeee-0000-4000-8000-000000000005'::uuid,
      0,
      2.98,
      'low_battery',
      12.4,
      now() - interval '8 minutes'
    ),
    (
      'eeeeeeee-0000-4000-8000-000000000006'::uuid,
      0,
      3.17,
      'online',
      0.8,
      now() - interval '4 minutes'
    );

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000007'::uuid,
    135 + (g * 0.55)::double precision,
    3.09,
    'online',
    NULL,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000008'::uuid,
    185 + (g * 0.55)::double precision,
    2.92,
    'low_battery',
    NULL,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  SELECT
    'eeeeeeee-0000-4000-8000-000000000009'::uuid,
    105 + (g * 0.3)::double precision,
    3.16,
    'online',
    NULL,
    now() - (g * interval '2 hours')
  FROM generate_series(0, 23) AS g;

  INSERT INTO public.telemetry_readings (sensor_node_id, water_level_cm, battery_voltage, node_status, scalar_reading, recorded_at)
  VALUES
    (
      'eeeeeeee-0000-4000-8000-000000000010'::uuid,
      88,
      0,
      'offline',
      NULL,
      now() - interval '3 days'
    );

  -- -----------------------------------------------------------------------------
  -- UUID quick reference (sensor_node_id for gateways)
  -- -----------------------------------------------------------------------------
  -- SN-001  eeeeeeee-0000-4000-8000-000000000001
  -- SN-002  eeeeeeee-0000-4000-8000-000000000002
  -- SN-003  eeeeeeee-0000-4000-8000-000000000003
  -- SN-004  eeeeeeee-0000-4000-8000-000000000004 
  -- SN-005  eeeeeeee-0000-4000-8000-000000000005
  -- SN-006  eeeeeeee-0000-4000-8000-000000000006
  -- SN-007  eeeeeeee-0000-4000-8000-000000000007
  -- SN-008  eeeeeeee-0000-4000-8000-000000000008
  -- SN-009  eeeeeeee-0000-4000-8000-000000000009
  -- SN-010  eeeeeeee-0000-4000-8000-000000000010

  -- -----------------------------------------------------------------------------
  -- Critical SMS recipients (Termii via Vercel /api/send-termii-sms)
  -- Replace with real MSISDNs (digits only, country code, no +). Roles: admin | dispatcher.
  -- -----------------------------------------------------------------------------
  -- INSERT INTO public.alert_sms_recipients (display_name, phone_number, role, is_active)
  -- VALUES
  --   ('Ops lead', '2348012345678', 'admin', true),
  --   ('Dispatch desk', '2348098765432', 'dispatcher', true);
