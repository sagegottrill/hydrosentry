-- =============================================================================
-- HydroSentry — PostgreSQL schema for Supabase
-- Run in Supabase SQL Editor or via `psql`. Requires pgcrypto for UUIDs.
-- Safe to re-run: enums/tables/indexes/triggers/policies skip if already present.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enumerations (align with src/types/hydrosentry.ts)
-- -----------------------------------------------------------------------------

DO $enum$
BEGIN
  BEGIN
    CREATE TYPE public.sensor_hardware_type AS ENUM (
      'water_level',
      'rain_gauge',
      'flow_meter'
    );
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.node_status_type AS ENUM (
      'online',
      'offline',
      'low_battery'
    );
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.season_type AS ENUM ('wet', 'dry');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.alert_priority_type AS ENUM ('critical', 'warning', 'info');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.risk_level_type AS ENUM ('high', 'medium', 'low');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.risk_zone_kind AS ENUM ('flood', 'waste', 'overflow');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.borehole_status_type AS ENUM ('operational', 'failure', 'maintenance');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.route_status_type AS ENUM ('verified', 'unverified', 'blocked');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.route_kind AS ENUM ('herder', 'evacuation', 'supply');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.alert_source_type AS ENUM ('field', 'operator', 'telemetry');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE TYPE public.tinyml_status_type AS ENUM ('normal', 'anomaly_detected', 'processing');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $enum$;

-- -----------------------------------------------------------------------------
-- sensor_nodes — static / slow-changing node registry
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sensor_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_code text UNIQUE,
  name text NOT NULL,
  location text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  type public.sensor_hardware_type NOT NULL,
  signal_strength integer NOT NULL DEFAULT 0 CHECK (signal_strength >= 0 AND signal_strength <= 100),
  reading_unit text NOT NULL DEFAULT 'cm',
  tinyml_status public.tinyml_status_type NOT NULL DEFAULT 'normal',
  firmware_version text NOT NULL DEFAULT 'v0.0.0',
  installed_date date NOT NULL DEFAULT CURRENT_DATE,
  assigned_warden text NOT NULL DEFAULT '',
  warning_threshold double precision NOT NULL DEFAULT 0,
  critical_threshold double precision NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_nodes_type ON public.sensor_nodes (type);
CREATE INDEX IF NOT EXISTS idx_sensor_nodes_public_code ON public.sensor_nodes (public_code) WHERE public_code IS NOT NULL;

COMMENT ON TABLE public.sensor_nodes IS 'ESP32-class edge nodes; live depth/power in telemetry_readings.';

-- -----------------------------------------------------------------------------
-- telemetry_readings — high-frequency gateway inserts
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.telemetry_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_node_id uuid NOT NULL REFERENCES public.sensor_nodes (id) ON DELETE CASCADE,
  water_level_cm double precision NOT NULL DEFAULT 0,
  battery_voltage double precision NOT NULL,
  node_status public.node_status_type NOT NULL,
  scalar_reading double precision,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_node_time ON public.telemetry_readings (sensor_node_id, recorded_at DESC);

COMMENT ON COLUMN public.telemetry_readings.water_level_cm IS 'JSN-SR04T depth (cm); 0 if N/A.';
COMMENT ON COLUMN public.telemetry_readings.scalar_reading IS 'Rain (mm/h), flow (m³/s), etc.; optional.';
COMMENT ON TABLE public.telemetry_readings IS 'LoRaWAN / gateway POST target; RLS allows anon INSERT.';

-- -----------------------------------------------------------------------------
-- risk_zones — lat/lon point (PostGIS optional later)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.risk_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.risk_zone_kind NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  severity public.risk_level_type NOT NULL,
  season public.season_type NOT NULL,
  blockage_type text,
  description text,
  linked_sensor_node_id uuid REFERENCES public.sensor_nodes (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_zones_season ON public.risk_zones (season);

-- -----------------------------------------------------------------------------
-- boreholes
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.boreholes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status public.borehole_status_type NOT NULL,
  thirst_index double precision NOT NULL,
  crpd_score double precision NOT NULL,
  last_maintenance_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- routes — polyline as JSONB [[lat, lng], ...] matching frontend tuples
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coordinates jsonb NOT NULL CHECK (jsonb_typeof(coordinates) = 'array'),
  status public.route_status_type NOT NULL,
  type public.route_kind NOT NULL,
  season public.season_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routes_season ON public.routes (season);

COMMENT ON COLUMN public.routes.coordinates IS 'Array of [lat, lng] pairs; matches TypeScript [number, number][].';

-- -----------------------------------------------------------------------------
-- alerts
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  priority public.alert_priority_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  recommendation text NOT NULL,
  action_label text NOT NULL,
  estimated_cost numeric(14, 2),
  season public.season_type NOT NULL,
  zone_id uuid REFERENCES public.risk_zones (id) ON DELETE SET NULL,
  borehole_id uuid REFERENCES public.boreholes (id) ON DELETE SET NULL,
  sensor_node_id uuid REFERENCES public.sensor_nodes (id) ON DELETE SET NULL,
  telemetry_snapshot jsonb,
  alert_source public.alert_source_type,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_alerts_season ON public.alerts (season);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts (priority);

COMMENT ON COLUMN public.alerts.telemetry_snapshot IS 'Optional SensorTelemetrySnapshot JSON.';

-- Optional warden mobile notes (Action Dispatcher shows under title).
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS field_notes text;

-- -----------------------------------------------------------------------------
-- alert_sms_recipients — ops MSISDNs for critical Termii SMS (admin / dispatcher)
-- Queried server-side only (Vercel + SUPABASE_SERVICE_ROLE_KEY). Not exposed to anon.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.alert_sms_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL DEFAULT '',
  phone_number text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'dispatcher')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_sms_recipients_phone ON public.alert_sms_recipients (phone_number);

COMMENT ON TABLE public.alert_sms_recipients IS 'Phone numbers for critical warden field SMS; roles admin | dispatcher.';

ALTER TABLE public.alert_sms_recipients ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sensor_nodes_updated ON public.sensor_nodes;
CREATE TRIGGER tr_sensor_nodes_updated
  BEFORE UPDATE ON public.sensor_nodes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS tr_risk_zones_updated ON public.risk_zones;
CREATE TRIGGER tr_risk_zones_updated
  BEFORE UPDATE ON public.risk_zones
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS tr_boreholes_updated ON public.boreholes;
CREATE TRIGGER tr_boreholes_updated
  BEFORE UPDATE ON public.boreholes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS tr_routes_updated ON public.routes;
CREATE TRIGGER tr_routes_updated
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RPC: latest telemetry row per node (SECURITY DEFINER for stable reads under RLS)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.latest_telemetry_by_node()
RETURNS TABLE (
  sensor_node_id uuid,
  water_level_cm double precision,
  battery_voltage double precision,
  node_status public.node_status_type,
  scalar_reading double precision,
  recorded_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (t.sensor_node_id)
    t.sensor_node_id,
    t.water_level_cm,
    t.battery_voltage,
    t.node_status,
    t.scalar_reading,
    t.recorded_at
  FROM public.telemetry_readings t
  ORDER BY t.sensor_node_id, t.recorded_at DESC;
$$;

REVOKE ALL ON FUNCTION public.latest_telemetry_by_node() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.latest_telemetry_by_node() TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE public.sensor_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boreholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_sms_recipients ENABLE ROW LEVEL SECURITY;

-- sensor_nodes: read for SPA + gateways that only insert telemetry still need FK target visibility;
-- in Supabase, INSERT into telemetry does not require SELECT on parent for anon if FK validated server-side —
-- still expose read for dashboard.

DROP POLICY IF EXISTS sensor_nodes_select_anon ON public.sensor_nodes;
CREATE POLICY sensor_nodes_select_anon
  ON public.sensor_nodes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS sensor_nodes_select_authenticated ON public.sensor_nodes;
CREATE POLICY sensor_nodes_select_authenticated
  ON public.sensor_nodes FOR SELECT TO authenticated USING (true);

-- telemetry_readings: public INSERT for field gateways (anon key)

DROP POLICY IF EXISTS telemetry_readings_insert_anon ON public.telemetry_readings;
CREATE POLICY telemetry_readings_insert_anon
  ON public.telemetry_readings FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS telemetry_readings_insert_authenticated ON public.telemetry_readings;
CREATE POLICY telemetry_readings_insert_authenticated
  ON public.telemetry_readings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS telemetry_readings_select_anon ON public.telemetry_readings;
CREATE POLICY telemetry_readings_select_anon
  ON public.telemetry_readings FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS telemetry_readings_select_authenticated ON public.telemetry_readings;
CREATE POLICY telemetry_readings_select_authenticated
  ON public.telemetry_readings FOR SELECT TO authenticated USING (true);

-- Reference / ops tables: read-only for client roles (writes via service_role / dashboard admin later)

DROP POLICY IF EXISTS risk_zones_select_anon ON public.risk_zones;
CREATE POLICY risk_zones_select_anon
  ON public.risk_zones FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS risk_zones_select_authenticated ON public.risk_zones;
CREATE POLICY risk_zones_select_authenticated
  ON public.risk_zones FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS boreholes_select_anon ON public.boreholes;
CREATE POLICY boreholes_select_anon
  ON public.boreholes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS boreholes_select_authenticated ON public.boreholes;
CREATE POLICY boreholes_select_authenticated
  ON public.boreholes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS routes_select_anon ON public.routes;
CREATE POLICY routes_select_anon
  ON public.routes FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS routes_select_authenticated ON public.routes;
CREATE POLICY routes_select_authenticated
  ON public.routes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS alerts_select_anon ON public.alerts;
CREATE POLICY alerts_select_anon
  ON public.alerts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS alerts_select_authenticated ON public.alerts;
CREATE POLICY alerts_select_authenticated
  ON public.alerts FOR SELECT TO authenticated USING (true);

-- Warden mobile form + ops dashboards: INSERT field reports (anon SPA key).

DROP POLICY IF EXISTS alerts_insert_anon ON public.alerts;
CREATE POLICY alerts_insert_anon
  ON public.alerts FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS alerts_insert_authenticated ON public.alerts;
CREATE POLICY alerts_insert_authenticated
  ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);

-- alert_sms_recipients: Admin-managed team phonebook.
-- Demo policy: allow SPA reads/writes (tighten later with auth).

DROP POLICY IF EXISTS alert_sms_recipients_select_anon ON public.alert_sms_recipients;
CREATE POLICY alert_sms_recipients_select_anon
  ON public.alert_sms_recipients FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS alert_sms_recipients_select_authenticated ON public.alert_sms_recipients;
CREATE POLICY alert_sms_recipients_select_authenticated
  ON public.alert_sms_recipients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS alert_sms_recipients_insert_anon ON public.alert_sms_recipients;
CREATE POLICY alert_sms_recipients_insert_anon
  ON public.alert_sms_recipients FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS alert_sms_recipients_insert_authenticated ON public.alert_sms_recipients;
CREATE POLICY alert_sms_recipients_insert_authenticated
  ON public.alert_sms_recipients FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS alert_sms_recipients_update_anon ON public.alert_sms_recipients;
CREATE POLICY alert_sms_recipients_update_anon
  ON public.alert_sms_recipients FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS alert_sms_recipients_update_authenticated ON public.alert_sms_recipients;
CREATE POLICY alert_sms_recipients_update_authenticated
  ON public.alert_sms_recipients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- API privileges (PostgREST / Supabase client)
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.sensor_nodes TO anon, authenticated;
GRANT SELECT ON public.telemetry_readings TO anon, authenticated;
GRANT INSERT ON public.telemetry_readings TO anon, authenticated;
GRANT SELECT ON public.risk_zones TO anon, authenticated;
GRANT SELECT ON public.boreholes TO anon, authenticated;
GRANT SELECT ON public.routes TO anon, authenticated;
GRANT SELECT, INSERT ON public.alerts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.alert_sms_recipients TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- Realtime: notify subscribed clients when gateways INSERT telemetry.
-- Supabase Dashboard: Database → Publications → supabase_realtime → add
--   public.telemetry_readings (or rely on the block below).
-- Also: public.alerts for warden field reports → Action Dispatcher.
-- -----------------------------------------------------------------------------
DO $realtime$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'telemetry_readings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry_readings;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  END IF;
END $realtime$;

-- -----------------------------------------------------------------------------
-- Seed data & gateway REST examples: run supabase_seed.sql after this file.
-- -----------------------------------------------------------------------------
