import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-only Termii SMS send. Secrets live in Vercel env (or .env.local for `vercel dev`), never in the browser.
 * Destination MSISDN is server-side only (TERMII_ALERT_PHONE) to avoid client-controlled SMS abuse.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.TERMII_API_KEY;
  const baseUrl = (process.env.TERMII_BASE_URL || 'https://v3.api.termii.com').replace(/\/$/, '');
  const toRaw = process.env.TERMII_ALERT_PHONE;
  const to = toRaw?.replace(/\D/g, '') ?? '';
  const from = process.env.TERMII_SENDER_ID || 'N-Alert';

  if (!apiKey) {
    return res.status(503).json({ error: 'TERMII_API_KEY is not configured on the server.' });
  }
  if (!to || to.length < 10) {
    return res.status(503).json({
      error: 'TERMII_ALERT_PHONE is not configured (use country code + number, no +, e.g. 2348012345678).',
    });
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

  const payload = {
    to,
    from,
    sms: message,
    type: 'plain',
    channel: 'dnd',
    api_key: apiKey,
  };

  try {
    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: unknown;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      return res.status(502).json({ error: 'Termii API returned an error', termii: data });
    }

    return res.status(200).json({ success: true, termii: data });
  } catch (err) {
    console.error('[send-termii-sms]', err);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
}
