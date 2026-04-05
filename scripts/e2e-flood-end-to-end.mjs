/**
 * End-to-end CLI verification: FK report → insert sensor_node → insert telemetry →
 * secrets → deploy → HTTP invoke mock webhook payload (supabase CLI has no `functions invoke`).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
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
  return m ? m[1] : null;
}

function runQuery(file) {
  const p = path.join(root, file);
  return execSync(`npx supabase db query --linked --agent=no -o json -f ${JSON.stringify(p)}`, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function parseQueryJson(stdout) {
  const j = JSON.parse(stdout.trim());
  if (Array.isArray(j)) return { rows: j };
  if (Array.isArray(j.rows)) return j;
  if (j.rows) return j;
  throw new Error(`Unexpected query output: ${stdout.slice(0, 200)}`);
}

const env = loadEnv(path.join(root, ".env"));
const supabaseUrl =
  env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon =
  env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const ref =
  projectRefFromUrl(supabaseUrl) ||
  (fs.existsSync(path.join(root, "supabase", ".temp", "project-ref"))
    ? fs.readFileSync(path.join(root, "supabase", ".temp", "project-ref"), "utf8").trim()
    : "");

console.log("\n========== 1) FK constraints on telemetry_readings ==========\n");
const fkOut = runQuery("scripts/sql/e2e-01-fk-telemetry.sql");
console.log(fkOut.trim());
const fkParsed = parseQueryJson(fkOut);
if (!fkParsed.rows?.length) {
  console.warn("(No FK rows returned — table may be missing or name differs.)\n");
}

console.log("\n========== 2) INSERT dummy sensor_node (parent for FK) ==========\n");
const nodeOut = runQuery("scripts/sql/e2e-02-insert-node.sql");
console.log(nodeOut.trim());
const nodeParsed = parseQueryJson(nodeOut);
const sensorNodeId = nodeParsed.rows?.[0]?.sensor_node_id;
if (!sensorNodeId) {
  console.error("Failed to get sensor_node_id from INSERT RETURNING.");
  process.exit(1);
}
console.log("\n→ sensor_node_id:", sensorNodeId, "\n");

console.log("\n========== 3) INSERT telemetry_readings (water_level_cm = 105) ==========\n");
const telSql = `
INSERT INTO public.telemetry_readings (
  sensor_node_id,
  water_level_cm,
  battery_voltage,
  node_status
) VALUES (
  '${sensorNodeId}'::uuid,
  105,
  3.7,
  'online'::public.node_status_type
)
RETURNING id AS telemetry_reading_id, sensor_node_id, water_level_cm;
`.trim();
const telFile = path.join(root, "scripts", ".e2e-telemetry-temp.sql");
fs.writeFileSync(telFile, telSql, "utf8");
let telOut;
try {
  telOut = execSync(`npx supabase db query --linked --agent=no -o json -f ${JSON.stringify(telFile)}`, {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
} finally {
  try {
    fs.unlinkSync(telFile);
  } catch {
    /* ignore */
  }
}
console.log(telOut.trim());

console.log("\n========== 4) secrets set TERMII_API_KEY (mock) ==========\n");
execSync("npx supabase secrets set TERMII_API_KEY=TERMII_TEST_KEY_123", {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

console.log("\n========== 5) deploy send-flood-alert ==========\n");
execSync("npx supabase functions deploy send-flood-alert", {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

if (!ref || !anon) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env for HTTP invoke.");
  process.exit(1);
}

const functionUrl = `https://${ref}.supabase.co/functions/v1/send-flood-alert`;
const webhookBody = {
  type: "INSERT",
  table: "telemetry_readings",
  schema: "public",
  record: {
    sensor_node_id: sensorNodeId,
    water_level_cm: 105,
    battery_voltage: 3.7,
    node_status: "online",
  },
  old_record: null,
};

console.log("\n========== 6–7) Invoke deployed function (CLI has no `functions invoke`; using fetch) ==========\n");
console.log("POST", functionUrl, "\n");

const res = await fetch(functionUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anon}`,
    apikey: anon,
  },
  body: JSON.stringify(webhookBody),
});

const text = await res.text();
console.log("HTTP", res.status, res.statusText);
console.log("\n----- Response body -----\n");
console.log(text);
console.log("\n----- End -----\n");

if (res.status !== 200) {
  process.exit(1);
}
if (!text.includes("MOCK MODE ACTIVE")) {
  console.warn("Note: expected '🛠️ MOCK MODE ACTIVE' in JSON body for mock key.");
}
