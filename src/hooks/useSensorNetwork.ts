import { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SensorHardwareType, SensorNode } from '@/types/hydrosentry';
import { getWaterLevelSeverity } from '@/lib/sensorTelemetry';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export interface ReadingPoint {
  time: string;
  value: number;
}

interface SensorNodeRow {
  id: string;
  public_code: string | null;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  type: SensorHardwareType;
  signal_strength: number;
  reading_unit: string;
  tinyml_status: string;
  firmware_version: string;
  installed_date: string;
  assigned_warden: string;
  warning_threshold: number;
  critical_threshold: number;
}

interface TelemetryLatestRow {
  sensor_node_id: string;
  water_level_cm: number;
  battery_voltage: number;
  node_status: SensorNode['node_status'];
  scalar_reading: number | null;
  recorded_at: string;
}

interface TelemetryHistoryRow {
  sensor_node_id: string;
  water_level_cm: number;
  scalar_reading: number | null;
  recorded_at: string;
}

function asTinyml(s: string): SensorNode['tinymlStatus'] {
  if (s === 'anomaly_detected' || s === 'processing') return s;
  return 'normal';
}

function formatLastUpdated(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function mapRowToSensorNode(
  row: SensorNodeRow,
  latest: TelemetryLatestRow | undefined,
): SensorNode {
  const hasLatest = Boolean(latest?.recorded_at);
  const waterCm = hasLatest ? Number(latest!.water_level_cm) : 0;
  const voltage = hasLatest ? Number(latest!.battery_voltage) : 0;
  const nodeStatus = hasLatest ? latest!.node_status : 'offline';
  const scalar = hasLatest && latest!.scalar_reading != null ? Number(latest!.scalar_reading) : null;

  const isWater = row.type === 'water_level';
  const currentReading = isWater ? waterCm : scalar ?? 0;

  const base: SensorNode = {
    id: row.id,
    ...(row.public_code ? { publicCode: row.public_code } : {}),
    name: row.name,
    location: row.location,
    coordinates: [row.latitude, row.longitude],
    type: row.type,
    water_level_cm: isWater ? waterCm : 0,
    battery_voltage: voltage,
    node_status: nodeStatus,
    signal_strength: row.signal_strength,
    currentReading,
    readingUnit: row.reading_unit,
    lastUpdated: formatLastUpdated(latest?.recorded_at),
    tinymlStatus: asTinyml(row.tinyml_status),
    firmwareVersion: row.firmware_version,
    installedDate: row.installed_date?.slice(0, 10) ?? '',
    assignedWarden: row.assigned_warden,
    warningThreshold: Number(row.warning_threshold),
    criticalThreshold: Number(row.critical_threshold),
  };

  const wl = getWaterLevelSeverity(base);
  if (wl === 'critical') {
    return { ...base, tinymlStatus: 'anomaly_detected' };
  }
  if (wl === 'warning') {
    return { ...base, tinymlStatus: 'anomaly_detected' };
  }
  return base;
}

function buildHistories(
  nodes: SensorNode[],
  rows: TelemetryHistoryRow[] | null | undefined,
): Record<string, ReadingPoint[]> {
  const typeById = new Map(nodes.map((n) => [n.id, n.type]));
  const out: Record<string, ReadingPoint[]> = {};
  for (const n of nodes) {
    out[n.id] = [];
  }
  if (!rows?.length) return out;

  for (const r of rows) {
    const t = typeById.get(r.sensor_node_id);
    if (!t) continue;
    const value =
      t === 'water_level' ? Number(r.water_level_cm) : Number(r.scalar_reading ?? 0);
    const time = new Date(r.recorded_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    if (!out[r.sensor_node_id]) out[r.sensor_node_id] = [];
    out[r.sensor_node_id].push({ time, value: Math.round(value * 10) / 10 });
  }

  for (const id of Object.keys(out)) {
    const arr = out[id];
    if (arr.length > 96) {
      out[id] = arr.slice(-96);
    }
  }
  return out;
}

async function fetchSensorNetwork(): Promise<{
  nodes: SensorNode[];
  readingHistories: Record<string, ReadingPoint[]>;
}> {
  if (!supabase) {
    return { nodes: [], readingHistories: {} };
  }

  const fromIso = new Date(Date.now() - 48 * 3600000).toISOString();

  const [nodesRes, latestRes, histRes] = await Promise.all([
    supabase.from('sensor_nodes').select('*').order('name'),
    supabase.rpc('latest_telemetry_by_node'),
    supabase
      .from('telemetry_readings')
      .select('sensor_node_id, water_level_cm, scalar_reading, recorded_at')
      .gte('recorded_at', fromIso)
      .order('recorded_at', { ascending: true })
      .limit(8000),
  ]);

  if (nodesRes.error) throw nodesRes.error;
  if (latestRes.error) throw latestRes.error;
  if (histRes.error) throw histRes.error;

  const nodeRows = (nodesRes.data ?? []) as SensorNodeRow[];
  const latestRows = (latestRes.data ?? []) as TelemetryLatestRow[];
  const latestByNode = new Map(latestRows.map((r) => [r.sensor_node_id, r]));

  const nodes = nodeRows.map((row) => mapRowToSensorNode(row, latestByNode.get(row.id)));
  const readingHistories = buildHistories(nodes, histRes.data as TelemetryHistoryRow[] | undefined);

  return { nodes, readingHistories };
}

const QUERY_KEY = ['sensor-network'] as const;

const TELEMETRY_SIMULATOR_MS = 8_000;

function simulateTelemetryRow(node: SensorNode): {
  sensor_node_id: string;
  water_level_cm: number;
  battery_voltage: number;
  node_status: SensorNode['node_status'];
  scalar_reading: number | null;
} {
  const drift = (Math.random() - 0.5) * 4;
  const bat = Math.max(
    2.85,
    Math.min(3.25, node.battery_voltage + (Math.random() - 0.5) * 0.04),
  );
  const lowBat = bat < 3.0;
  if (node.type === 'water_level') {
    return {
      sensor_node_id: node.id,
      water_level_cm: Math.max(0, node.water_level_cm + drift),
      battery_voltage: bat,
      node_status: lowBat ? 'low_battery' : 'online',
      scalar_reading: null,
    };
  }
  return {
    sensor_node_id: node.id,
    water_level_cm: 0,
    battery_voltage: bat,
    node_status: lowBat ? 'low_battery' : 'online',
    scalar_reading: Math.max(0, node.currentReading + drift),
  };
}

/**
 * Live values come from the **latest row** per node in `telemetry_readings`.
 * Motion in the UI = gateways **inserting new rows** often + this hook **refetching**.
 * We use Supabase Realtime on INSERT (instant) and a short poll (fallback).
 *
 * Without hardware, set `VITE_SIMULATE_TELEMETRY=true` to INSERT drifted readings on a timer.
 */
export function useSensorNetwork() {
  const queryClient = useQueryClient();
  const invalidateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simulateTelemetry = import.meta.env.VITE_SIMULATE_TELEMETRY === 'true';

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const scheduleRefetch = () => {
      if (invalidateDebounceRef.current) clearTimeout(invalidateDebounceRef.current);
      invalidateDebounceRef.current = setTimeout(() => {
        invalidateDebounceRef.current = null;
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }, 200);
    };

    const channel = supabase
      .channel('hydrosentry-telemetry')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry_readings' },
        scheduleRefetch,
      )
      .subscribe((status, err) => {
        if (import.meta.env.DEV && status === 'CHANNEL_ERROR') {
          console.warn(
            '[HydroSentry] Realtime channel error — charts still refresh on poll. Check that',
            '`telemetry_readings` is in publication `supabase_realtime` (see supabase_schema.sql).',
            err,
          );
        }
      });

    return () => {
      if (invalidateDebounceRef.current) clearTimeout(invalidateDebounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!simulateTelemetry || !isSupabaseConfigured || !supabase) return;

    const tick = async () => {
      const cached = queryClient.getQueryData<{ nodes: SensorNode[] }>(QUERY_KEY);
      if (!cached?.nodes?.length) return;
      const shuffled = [...cached.nodes].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, Math.min(4, shuffled.length));
      for (const node of picks) {
        const row = simulateTelemetryRow(node);
        const { error } = await supabase.from('telemetry_readings').insert(row);
        if (error && import.meta.env.DEV) console.warn('[HydroSentry] telemetry sim insert:', error.message);
      }
    };

    const id = setInterval(() => void tick(), TELEMETRY_SIMULATOR_MS);
    const boot = setTimeout(() => void tick(), 1_500);
    return () => {
      clearInterval(id);
      clearTimeout(boot);
    };
  }, [queryClient, simulateTelemetry]);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSensorNetwork,
    enabled: isSupabaseConfigured && supabase !== null,
    refetchInterval: 5_000,
    staleTime: 3_000,
  });

  const nodes = query.data?.nodes ?? [];
  const readingHistories = query.data?.readingHistories ?? {};

  const stats = useMemo(() => {
    const n = query.data?.nodes ?? [];
    const activeForAvg = n.filter((node) => node.node_status !== 'offline');
    const avgBatteryVoltage =
      activeForAvg.length === 0
        ? 0
        : Math.round(
            (activeForAvg.reduce((a, node) => a + node.battery_voltage, 0) / activeForAvg.length) * 1000,
          ) / 1000;

    return {
      total: n.length,
      online: n.filter((node) => node.node_status === 'online').length,
      lowBattery: n.filter((node) => node.node_status === 'low_battery').length,
      hydroWarning: n.filter((node) => getWaterLevelSeverity(node) === 'warning').length,
      hydroCritical: n.filter((node) => getWaterLevelSeverity(node) === 'critical').length,
      offline: n.filter((node) => node.node_status === 'offline').length,
      avgBatteryVoltage,
    };
  }, [query.data]);

  return {
    nodes,
    readingHistories,
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
