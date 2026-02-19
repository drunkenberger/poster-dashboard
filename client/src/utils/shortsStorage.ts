import type { BulkPostItem } from '../../../shared/types/index.ts';

const KEY = 'shorts-bulk-items';

export function saveClipsForBulk(items: BulkPostItem[]): void {
  sessionStorage.setItem(KEY, JSON.stringify(items));
}

export function loadClipsForBulk(): BulkPostItem[] | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw) as BulkPostItem[];
}

export function clearClipsForBulk(): void {
  sessionStorage.removeItem(KEY);
}
