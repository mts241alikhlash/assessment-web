/** A seat is drawn red once its last heartbeat is older than this. */
export const SEAT_STALE_MS = 60_000

export function isSeatDead(
  lastSeenAt: string | null,
  now: Date,
  thresholdMs = SEAT_STALE_MS,
): boolean {
  if (lastSeenAt === null) return true
  return now.getTime() - new Date(lastSeenAt).getTime() > thresholdMs
}
