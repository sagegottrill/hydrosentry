import { supabase } from '@/lib/supabaseClient';
import type { AlertPriority, Season } from '@/types/hydrosentry';

export type WardenFieldHardwareStatus = 'nominal' | 'battery' | 'silt';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function payloadForStatus(
  status: WardenFieldHardwareStatus,
  nodeLabel: string,
  nodeLocation: string,
  publicCode: string | undefined,
  season: Season,
): {
  priority: AlertPriority;
  title: string;
  description: string;
  recommendation: string;
  action_label: string;
  estimated_cost: number | null;
} {
  const locLine = publicCode
    ? `${publicCode} — ${nodeLabel} · ${nodeLocation}`
    : `${nodeLabel} · ${nodeLocation}`;

  switch (status) {
    case 'nominal':
      return {
        priority: 'info',
        title: `Node nominal — ${nodeLabel}`,
        description: `Data Scout confirmed operational hardware at ${nodeLocation}.`,
        recommendation: 'Log check; continue routine monitoring.',
        action_label: 'Acknowledge',
        estimated_cost: null,
      };
    case 'battery':
      return {
        priority: 'critical',
        title: `Battery degraded / swollen — ${nodeLabel}`,
        description: `Warden reported battery hardware concern at ${locLine}.`,
        recommendation: 'Dispatch technician for battery inspection or replacement.',
        action_label: 'Alert Technician',
        estimated_cost: 45000,
      };
    case 'silt':
      return {
        priority: 'critical',
        title: `Sensor fouled (silt/mud) — ${nodeLabel}`,
        description: `Warden reported sensor fouling at ${locLine}; cleaning or recalibration may be required.`,
        recommendation: 'Schedule cleaning / inspection crew.',
        action_label: 'Dispatch Crew',
        estimated_cost: 28000,
      };
  }
}

export type WardenInsertParams = {
  sensorNodeId: string;
  nodeLabel: string;
  nodeLocation: string;
  publicCode?: string;
  status: WardenFieldHardwareStatus;
  notesTrimmed: string;
  season: Season;
};

export async function insertWardenFieldReport(
  params: WardenInsertParams,
): Promise<{ id: string } | { error: string }> {
  if (!supabase) return { error: 'Supabase is not configured.' };

  const meta = payloadForStatus(
    params.status,
    params.nodeLabel,
    params.nodeLocation,
    params.publicCode,
    params.season,
  );

  const row = {
    priority: meta.priority,
    title: meta.title,
    description: meta.description,
    location: params.nodeLocation,
    recommendation: meta.recommendation,
    action_label: meta.action_label,
    estimated_cost: meta.estimated_cost,
    season: params.season,
    sensor_node_id: isUuid(params.sensorNodeId) ? params.sensorNodeId : null,
    telemetry_snapshot: null,
    alert_source: 'field' as const,
    field_notes: params.notesTrimmed.length > 0 ? params.notesTrimmed : null,
  };

  const { data, error } = await supabase.from('alerts').insert(row).select('id').single();

  if (error) return { error: error.message };
  if (!data?.id) return { error: 'Insert succeeded but no id returned.' };
  return { id: data.id as string };
}
