/**
 * Creates the same DB → Edge Function wiring as Dashboard → Database Webhooks:
 * AFTER INSERT on telemetry_readings → POST send-flood-alert with webhook-shaped JSON.
 *
 * Requires: linked project (`npx supabase link`), and .env with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 * (or SUPABASE_URL + SUPABASE_ANON_KEY).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

function loadEnv(file) {
  if (!fs.existsSync(file)) {
    console.error("Missing .env at", file);
    process.exit(1);
  }
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function projectRefFromUrl(url) {
  const m = String(url).match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  if (!m) return null;
  return m[1];
}

const env = loadEnv(envPath);
const url =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  "";
const anon =
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let ref = projectRefFromUrl(url);
if (!ref) {
  const pr = path.join(root, "supabase", ".temp", "project-ref");
  if (fs.existsSync(pr)) ref = fs.readFileSync(pr, "utf8").trim();
}
if (!ref) {
  console.error(
    "Could not resolve project ref: set VITE_SUPABASE_URL in .env or run npx supabase link (creates supabase/.temp/project-ref).",
  );
  process.exit(1);
}

if (!anon) {
  console.error("Set VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY) in .env");
  process.exit(1);
}

function sqlStringLiteral(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

const functionUrl = `https://${ref}.supabase.co/functions/v1/send-flood-alert`;
const headersJson = JSON.stringify({
  "Content-Type": "application/json",
  Authorization: `Bearer ${anon}`,
  apikey: anon,
});

const sql = `
-- HydroSentry: INSERT telemetry → send-flood-alert (matches Dashboard webhook payload shape)
DROP TRIGGER IF EXISTS telemetry_readings_flood_alert ON public.telemetry_readings;

CREATE TRIGGER telemetry_readings_flood_alert
  AFTER INSERT ON public.telemetry_readings
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    ${sqlStringLiteral(functionUrl)},
    'POST',
    ${sqlStringLiteral(headersJson)},
    '{}',
    '8000'
  );
`.trim();

const tmp = path.join(root, "scripts", ".flood-webhook-temp.sql");
fs.writeFileSync(tmp, sql, "utf8");

try {
  execSync(`npx supabase db query --linked -f ${JSON.stringify(tmp)}`, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  console.log("\nDone: trigger telemetry_readings_flood_alert → send-flood-alert");
} finally {
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ignore */
  }
}
