import type { FieldReportKind } from '@/hooks/useAlertHistory';

export type WardenCriticalSmsOutcome = {
  sent: number;
  skipped: boolean;
  attempted?: number;
};

/** Same-origin API on Vercel; override for local `vercel dev` if needed (full URL to this path). */
function smsEndpointUrl(): string {
  const override = import.meta.env.VITE_SMS_API_URL?.trim();
  if (override) return override.replace(/\/$/, '');
  return '/api/send-termii-sms';
}

export function buildWardenCriticalSmsMessage(params: {
  status: FieldReportKind;
  nodeLabel: string;
  nodeLocation: string;
  publicCode?: string;
  notes: string;
}): string | null {
  if (params.status === 'nominal') return null;

  const loc = params.publicCode
    ? `${params.publicCode} — ${params.nodeLabel} · ${params.nodeLocation}`
    : `${params.nodeLabel} · ${params.nodeLocation}`;

  const statusLabel =
    params.status === 'battery' ? 'Battery Degraded/Swollen' : 'Sensor Fouled (Silt/Mud)';
  const notes = params.notes.trim() || '(none)';

  return `HYDROSENTRY ALERT: Critical issue reported at ${loc}. Status: ${statusLabel}. Notes: ${notes}`;
}

/**
 * Triggers server-side Termii dispatch. Recipients are loaded from Supabase
 * `alert_sms_recipients` (roles admin | dispatcher) — not queried in the browser.
 */
export async function requestWardenCriticalSms(message: string): Promise<WardenCriticalSmsOutcome> {
  const res = await fetch(smsEndpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    sent?: number;
    skipped?: boolean;
    attempted?: number;
  };

  if (!res.ok) {
    throw new Error(data.error || `SMS request failed (${res.status})`);
  }

  return {
    sent: typeof data.sent === 'number' ? data.sent : 0,
    skipped: Boolean(data.skipped),
    attempted: typeof data.attempted === 'number' ? data.attempted : undefined,
  };
}
