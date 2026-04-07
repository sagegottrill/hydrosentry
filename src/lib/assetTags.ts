const SN_RE = /^SN-(\d{1,3})$/i;

/**
 * Map stable public codes to professional asset tags used in UI.
 * This prevents UUID spam in demos and keeps review screenshots readable.
 */
const SN_ASSET_MAP: Record<string, string> = {
  'SN-001': 'HS-NGADDA-001',
  'SN-002': 'HS-GWANGE-002',
  'SN-003': 'HS-LAGOS-003',
  'SN-004': 'HS-ALAU-004',
  'SN-005': 'HS-JERE-005',
  'SN-006': 'HS-KONDUGA-006',
  'SN-007': 'HS-DIKWA-007',
  'SN-008': 'HS-BAMA-008',
  'SN-010': 'HS-MARTE-010',
  /** Pilot node (public_code already HS-* in DB). */
  'HS-GWOZA-012': 'HS-GWOZA-012',
};

function normalizeCode(input: string): string {
  const trimmed = input.trim();
  const m = trimmed.match(SN_RE);
  if (!m) return trimmed;
  const n = m[1].padStart(3, '0');
  return `SN-${n}`.toUpperCase();
}

function isUuidLike(input: string): boolean {
  // Loose check: enough to avoid long, repetitive DB primary keys in UI.
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.trim());
}

export function formatAssetTag(codeOrId: string): string {
  const raw = codeOrId.trim();
  const upper = raw.toUpperCase();

  // Legacy field-trial asset codes map to the canonical Gwoza pilot channel for command-center display.
  if (/^E2E-CLI-/i.test(raw) || /^e2e-cli-/i.test(raw)) {
    return 'HS-GWOZA-012';
  }

  const norm = normalizeCode(codeOrId);
  const mapped = SN_ASSET_MAP[norm.toUpperCase()];
  if (mapped) return mapped;

  // If we got a UUID from the DB, shorten to a field-friendly asset stub.
  if (isUuidLike(norm)) return `HS-ASSET-${norm.slice(0, 8).toUpperCase()}`;

  // Fall back to a cleaned identifier.
  return upper.includes('HS-') ? upper : norm.toUpperCase();
}

