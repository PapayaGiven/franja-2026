import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

/**
 * FRANJA 2026 happens in Colombia (UTC-5, no DST). All times rendered to
 * the user use es-CO conventions: lowercase a.m./p.m. with dots and a
 * narrow no-break space, matching the original event PDFs.
 *
 *   formatClock("08:30") -> "8:30 a.m."
 *   formatClock("19:30") -> "7:30 p.m."
 */
export function formatClock(hhmm: string): string {
  // Accept "HH:mm" or "HH:mm:ss" — Postgres time columns serialize as the
  // latter. Anything else returns as-is so we don't blow up on bad data.
  const trimmed = hhmm.slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(trimmed)) return hhmm;

  const dt = parse(trimmed, "HH:mm", new Date());
  // date-fns "a" gives "a. m." / "p. m." with es locale; the brief wants
  // the more conventional "a.m." / "p.m.". Hand-roll the period to match.
  const hour = format(dt, "h", { locale: es });
  const minute = format(dt, "mm", { locale: es });
  const meridiem = dt.getHours() < 12 ? "a.m." : "p.m.";
  return `${hour}:${minute} ${meridiem}`;
}

/**
 * "Jueves 9 de julio" — the long-form date used on agenda headers.
 */
export function formatLongDate(isoDate: string): string {
  const dt = new Date(`${isoDate}T12:00:00-05:00`);
  return format(dt, "EEEE d 'de' MMMM", { locale: es });
}

/**
 * "9 jul" — compact label for chips.
 */
export function formatShortDate(isoDate: string): string {
  const dt = new Date(`${isoDate}T12:00:00-05:00`);
  return format(dt, "d MMM", { locale: es });
}
