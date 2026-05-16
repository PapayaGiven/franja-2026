/**
 * Typed localStorage wrapper for the user's saved sessions / speakers /
 * exhibitors. Per the brief: personal data is local-only — clearing the
 * browser is acceptable data loss. No server roundtrip.
 *
 * Keys are namespaced under "franja:" so they coexist cleanly with
 * other apps on the same domain.
 */

const KEY = "franja:favorites";

export type FavoriteKind = "symposium" | "speaker" | "exhibitor";

export type Favorite = {
  kind: FavoriteKind;
  id: string;
  addedAt: number;
};

function read(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Favorite[]) : [];
  } catch {
    // Bad JSON or quota exceeded — best-effort: pretend the bag is empty.
    return [];
  }
}

function write(next: Favorite[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode — ignored, the next render will catch up */
  }
}

export function getFavorites(): Favorite[] {
  return read();
}

export function getFavoriteIds(kind: FavoriteKind): string[] {
  return read()
    .filter((f) => f.kind === kind)
    .map((f) => f.id);
}

export function isFavorite(kind: FavoriteKind, id: string): boolean {
  return read().some((f) => f.kind === kind && f.id === id);
}

export function addFavorite(kind: FavoriteKind, id: string) {
  const list = read();
  if (list.some((f) => f.kind === kind && f.id === id)) return;
  write([...list, { kind, id, addedAt: Date.now() }]);
}

export function removeFavorite(kind: FavoriteKind, id: string) {
  write(read().filter((f) => !(f.kind === kind && f.id === id)));
}

export function toggleFavorite(kind: FavoriteKind, id: string): boolean {
  if (isFavorite(kind, id)) {
    removeFavorite(kind, id);
    return false;
  }
  addFavorite(kind, id);
  return true;
}
