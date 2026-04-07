import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function normalizeMsisdn(raw: string): string {
  return raw.replace(/\D/g, '');
}

function maskMsisdn(digits: string): string {
  if (digits.length <= 4) return '****';
  return `${digits.slice(0, 3)}…${digits.slice(-2)}`;
}

/**
 * Load active admin/dispatcher phones from Supabase (service role only).
 */
async function fetchCriticalAlertRecipients(): Promise<string[]> {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    console.warn(
      '[send-termii-sms] SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY missing; cannot load alert_sms_recipients.',
    );
    return [];
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('alert_sms_recipients')
    .select('phone_number')
    .eq('is_active', true)
    .in('role', ['admin', 'dispatcher']);

  if (error) {
    console.error('[send-termii-sms] Supabase alert_sms_recipients query failed:', error.message);
    return [];
  }

  const normalized = (data ?? [])
    .map((row: { phone_number?: string }) => normalizeMsisdn(row.phone_number ?? ''))
    .filter((p) => p.length >= 10);

  return [...new Set(normalized)];
}

async function sendTermiiToRecipient(
  baseUrl: string,
  apiKey: string,
  from: string,
  to: string,
  message: string,
): Promise<{ ok: boolean; termii: unknown; status: number }> {
  const payload = {
    to,
    from,
    sms: message,
    type: 'plain',
    channel: 'dnd',
    api_key: apiKey,
  };

  const response = await fetch(`${baseUrl}/api/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let termii: unknown;
  try {
    termii = raw ? JSON.parse(raw) : null;
  } catch {
    termii = { raw };
  }

  return { ok: response.ok, termii, status: response.status };
}

/**
 * Server-only Termii SMS. Recipients come from public.alert_sms_recipients (admin | dispatcher).
 * Never exposes phone numbers to the browser.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.TERMII_API_KEY;
  const baseUrl = (process.env.TERMII_BASE_URL || 'https://v3.api.termii.com').replace(/\/$/, '');
  const from = process.env.TERMII_SENDER_ID || 'N-Alert';

  if (!apiKey) {
    return res.status(503).json({ error: 'TERMII_API_KEY is not configured on the server.' });
  }

  let body: { message?: string };
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 1600) {
    return res.status(400).json({ error: 'Field "message" is required (max 1600 characters).' });
  }

  const recipients = await fetchCriticalAlertRecipients();

  if (recipients.length === 0) {
    console.info(
      '[send-termii-sms] No active admin/dispatcher numbers in alert_sms_recipients; skipping SMS.',
    );
    return res.status(200).json({
      success: true,
      sent: 0,
      skipped: true,
      reason: 'no_recipients',
      results: [],
    });
  }

  const results: { to: string; ok: boolean; status?: number; termii?: unknown }[] = [];

  for (const to of recipients) {
    try {
      const { ok, termii, status } = await sendTermiiToRecipient(baseUrl, apiKey, from, to, message);
      results.push({ to: maskMsisdn(to), ok, status, termii });
      if (!ok) {
        console.warn('[send-termii-sms] Termii error for', maskMsisdn(to), 'status', status);
      }
    } catch (err) {
      console.error('[send-termii-sms] Send failed for', maskMsisdn(to), err);
      results.push({ to: maskMsisdn(to), ok: false, termii: { error: String(err) } });
    }
  }

  const sent = results.filter((r) => r.ok).length;

  return res.status(200).json({
    success: true,
    sent,
    attempted: recipients.length,
    skipped: false,
    results,
  });
}
