export type ReservationWindow = {start: Date; guests: number};

/** True when a candidate interval does not exceed branch seat capacity. */
export function hasReservationCapacity(input: {
  candidateStart: Date;
  candidateGuests: number;
  capacity: number;
  durationMinutes: number;
  existing: ReservationWindow[];
}): boolean {
  const {candidateStart, candidateGuests, capacity, durationMinutes, existing} = input;
  if (!Number.isFinite(candidateStart.getTime()) || !Number.isInteger(candidateGuests) || candidateGuests < 1) return false;
  if (!Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) return false;
  if (candidateGuests > capacity) return false;

  const durationMs = durationMinutes * 60_000;
  const candidateEnd = candidateStart.getTime() + durationMs;
  const occupied = existing.reduce((total, reservation) => {
    if (!Number.isFinite(reservation.start.getTime()) || !Number.isInteger(reservation.guests) || reservation.guests < 0) return total;
    const existingStart = reservation.start.getTime();
    const existingEnd = existingStart + durationMs;
    return existingStart < candidateEnd && existingEnd > candidateStart.getTime() ? total + reservation.guests : total;
  }, 0);
  return occupied + candidateGuests <= capacity;
}
