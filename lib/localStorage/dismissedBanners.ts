/**
 * Remembers which banners the user has X-ed out so the BannerStrip
 * doesn't re-show them. Per brief: localStorage only, namespaced.
 */

const KEY = "franja:dismissedBanners";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function write(next: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignored */
  }
}

export function getDismissedBanners(): string[] {
  return read();
}

export function dismissBanner(id: string) {
  const list = read();
  if (list.includes(id)) return;
  write([...list, id]);
}

export function isBannerDismissed(id: string): boolean {
  return read().includes(id);
}
