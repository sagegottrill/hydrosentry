/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** When "true", periodically INSERTs sample telemetry so gauges move without hardware. */
  readonly VITE_SIMULATE_TELEMETRY?: string;
  /** Optional full URL for POST /api/send-termii-sms (e.g. when using `vercel dev` on another port). */
  readonly VITE_SMS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
