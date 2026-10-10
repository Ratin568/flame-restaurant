export type DiscountKind = 'PERCENT' | 'FIXED';

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) throw new TypeError('Money value must be finite');
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateDiscount(
  subtotal: number,
  kind: DiscountKind,
  value: number,
): number {
  if (!Number.isFinite(subtotal) || subtotal < 0) throw new RangeError('Subtotal must be non-negative');
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Discount value must be non-negative');
  if (kind === 'PERCENT' && value > 100) throw new RangeError('Percent discount cannot exceed 100');
  return roundMoney(Math.min(kind === 'PERCENT' ? subtotal * value / 100 : value, subtotal));
}

export function calculateOrderTotal(subtotal: number, discount: number, deliveryFee: number): number {
  for (const [name, value] of Object.entries({subtotal, discount, deliveryFee})) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be non-negative`);
  }
  if (discount > subtotal) throw new RangeError('Discount cannot exceed subtotal');
  return roundMoney(subtotal - discount + deliveryFee);
}

export function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) throw new TypeError('Quantity must be finite');
  return Math.min(99, Math.max(1, Math.floor(quantity)));
}
