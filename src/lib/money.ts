export function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {style: 'currency', currency: 'USD'}).format(value);
}
/** فرمت ثابت دلار برای پنل ادمین (مستقل از زبان کاربر) */
export function formatPriceUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(value);
}