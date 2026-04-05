import type { Alert, Season, SensorTelemetrySnapshot } from '@/types/hydrosentry';

/** Row shape from Supabase Realtime / PostgREST (snake_case). */
export type AlertsTableRow = {
  id: string;
  priority: Alert['priority'];
  title: string;
  description: string;
  field_notes?: string | null;
  location: string;
  recommendation: string;
  action_label: string;
  estimated_cost?: number | string | null;
  season: Season;
  zone_id?: string | null;
  borehole_id?: string | null;
  sensor_node_id?: string | null;
  telemetry_snapshot?: SensorTelemetrySnapshot | null;
  alert_source?: Alert['alertSource'] | null;
  created_at: string;
  resolved_at?: string | null;
};

export function mapAlertsTableRowToAlert(row: AlertsTableRow): Alert {
  const est = row.estimated_cost;
  return {
    id: row.id,
    priority: row.priority,
    title: row.title,
    description: row.description,
    ...(row.field_notes?.trim() ? { fieldNotes: row.field_notes.trim() } : {}),
    location: row.location,
    recommendation: row.recommendation,
    actionLabel: row.action_label,
    ...(est != null && est !== '' ? { estimatedCost: Number(est) } : {}),
    season: row.season,
    ...(row.zone_id ? { zoneId: row.zone_id } : {}),
    ...(row.borehole_id ? { boreholeId: row.borehole_id } : {}),
    ...(row.sensor_node_id ? { sensorNodeId: row.sensor_node_id } : {}),
    ...(row.telemetry_snapshot ? { telemetry: row.telemetry_snapshot } : {}),
    ...(row.alert_source ? { alertSource: row.alert_source } : {}),
    createdAt: row.created_at,
    ...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
  };
}
