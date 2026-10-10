/** Convert a major-unit decimal amount to the provider's ISO-4217 minor units. */
export function toMinorUnits(amount: number, currency: string): number {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError('Amount must be a finite non-negative number');
  const normalized = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) throw new TypeError('Currency must be a three-letter ISO code');
  let digits: number;
  try {
    const resolvedDigits = new Intl.NumberFormat('en', {style: 'currency', currency: normalized}).resolvedOptions().maximumFractionDigits;
    if (resolvedDigits == null) throw new TypeError(`Minor-unit precision unavailable for ${normalized}`);
    digits = resolvedDigits;
  } catch {
    throw new TypeError(`Unsupported currency: ${normalized}`);
  }
  return Math.round((amount + Number.EPSILON) * 10 ** digits);
}
