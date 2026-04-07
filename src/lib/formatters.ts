/** UI formatting helpers for demo realism and consistency. */

export function formatFixed2(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(2);
}

export function formatCm2(valueCm: number): string {
  return `${formatFixed2(valueCm)} cm`;
}

export function formatVolts2(valueV: number): string {
  return `${formatFixed2(valueV)} V`;
}

