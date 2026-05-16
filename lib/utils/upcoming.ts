/**
 * Helpers for computing "starts in X min" for favorited sessions.
 * Used by UpcomingFavoriteBanner (Phase E).
 *
 * Colombia is fixed UTC-5 (no DST), so we anchor parsing there explicitly
 * instead of trusting the browser timezone.
 */

export function minutesUntil(day: string, startTime: string, now = new Date()): number {
  // day = "YYYY-MM-DD", startTime = "HH:mm" or "HH:mm:ss".
  const time = startTime.slice(0, 5);
  const start = new Date(`${day}T${time}:00-05:00`);
  return Math.floor((start.getTime() - now.getTime()) / 60_000);
}

export function isWithinNextMinutes(
  day: string,
  startTime: string,
  windowMin: number,
  now = new Date(),
): boolean {
  const m = minutesUntil(day, startTime, now);
  return m > 0 && m <= windowMin;
}
