export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export function formatEnergy(wh: number | null | undefined): string {
  if (wh == null) return '—';
  return `${(wh / 1000).toFixed(2)} kWh`;
}

/** Format integer cents → human readable amount */
export function formatCurrency(cents: number, currency = 'UZS'): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
