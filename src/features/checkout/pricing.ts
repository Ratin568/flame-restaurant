import {db} from '@/lib/db';
import type {CartModifier, CartVariant} from '@/stores/cart';

export type PricingLine = {
  productId: string;
  nameSnapshot: string;
  variant: string | null;
  modifiers: {name: string; price: number}[];
  quantity: number;
  unitPrice: number;
};

export type PricingResult = {
  lines: PricingLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
};

const DELIVERY_FEE = 2.99;
const FREE_DELIVERY_OVER = 25;

export async function priceCart(
  locale: string,
  rawItems: {
    productId: string;
    variant: CartVariant | null;
    modifiers: CartModifier[];
    quantity: number;
  }[],
  couponCode: string | null,
  orderType: 'DELIVERY' | 'PICKUP' | 'DINE_IN',
): Promise<PricingResult | null> {
  // ۱. شناسه‌های یکتا → یک کوئری به دیتابیس (N+1 نداریم!)
  const productIds = [...new Set(rawItems.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: {id: {in: productIds}, isAvailable: true},
    include: {variants: true, modifiers: true, translations: true},
  });

  const productsById = new Map(products.map((p) => [p.id, p]));
  const pick = <T extends {locale: string}>(list: T[]) =>
    list.find((x) => x.locale === locale) ?? list.find((x) => x.locale === 'en');

  const lines: PricingLine[] = [];

  for (const item of rawItems) {
    const product = productsById.get(item.productId);
    if (!product) return null; // محصول ناموجود/حذف‌شده → کل سرد اعتبار نمی‌شود

    const variant = item.variant
      ? product.variants.find((v) => v.id === item.variant!.id)
      : null;
    if (item.variant && !variant) return null;

    // فقط افزودنی‌هایی قبول می‌شوند که واقعاً برای این محصول ثبت شده‌اند
    const dbModifiers = item.modifiers
      .map((m) => product.modifiers.find((db) => db.id === m.id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    const base = Number(product.basePrice);
    const variantDelta = variant ? Number(variant.priceDelta) : 0;
    const modifierSum = dbModifiers.reduce((sum, m) => sum + Number(m.price), 0);
    const unitPrice = base + variantDelta + modifierSum;

    lines.push({
      productId: product.id,
      nameSnapshot: pick(product.translations)?.name ?? product.slug,
      variant: variant?.name ?? null,
      modifiers: dbModifiers.map((m) => ({name: m.name, price: Number(m.price)})),
      quantity: Math.min(Math.max(1, Math.floor(item.quantity)), 99),
      unitPrice,
    });
  }

  if (lines.length === 0) return null;

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  // ۲. اعتبارسنجی کوپن سمت سرور
  let discount = 0;
  let appliedCoupon: string | null = null;

  if (couponCode) {
    const coupon = await db.coupon.findUnique({where: {code: couponCode.toUpperCase().trim()}});
    const now = new Date();
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > now) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrder || subtotal >= Number(coupon.minOrder));

    if (valid && coupon) {
      discount =
        coupon.type === 'PERCENT'
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
      discount = Math.min(discount, subtotal);
      appliedCoupon = coupon.code;
    }
  }

  // ۳. ارسال فقط برای DELIVERY
  const deliveryFee =
    orderType === 'DELIVERY' ? (subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE) : 0;

  return {
    lines,
    subtotal: round2(subtotal),
    discount: round2(discount),
    deliveryFee,
    total: round2(subtotal - discount + deliveryFee),
    couponCode: appliedCoupon,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}