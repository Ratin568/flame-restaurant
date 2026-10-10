/** Convert a wall-clock date/time in an IANA time zone into a validated instant. */
export function parseFutureReservationDateTime(
  dateInput: string,
  timeInput: string,
  now = new Date(),
  timeZone = process.env.RESTAURANT_TIME_ZONE || 'UTC',
): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return null;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeInput)) return null;

  const [year, month, day] = dateInput.split('-').map(Number);
  const [hour, minute] = timeInput.split(':').map(Number);
  const targetUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const target = {year, month, day, hour, minute};

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
    const partsFor = (instant: Date) => {
      const parts = Object.fromEntries(formatter.formatToParts(instant).map((part) => [part.type, part.value]));
      return {year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour), minute: Number(parts.minute)};
    };

    // Iterate because the UTC offset may change around daylight-saving transitions.
    let instant = targetUtc;
    for (let i = 0; i < 3; i++) {
      const local = partsFor(new Date(instant));
      const representedAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, 0, 0);
      instant += targetUtc - representedAsUtc;
    }
    const result = new Date(instant);
    const resolved = partsFor(result);
    // Reject invalid calendar dates and wall-clock times skipped by DST.
    if (Object.keys(target).some((key) => target[key as keyof typeof target] !== resolved[key as keyof typeof resolved])) return null;
    if (result <= now) return null;
    return result;
  } catch {
    // Invalid IANA time zone configuration must fail closed, not accept a guessed time.
    return null;
  }
}
