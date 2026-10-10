import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateDiscount, calculateOrderTotal, normalizeQuantity, roundMoney} from '../../src/features/checkout/pricing-math.ts';
import {parseFutureReservationDateTime} from '../../src/lib/validation/reservation-date-time.ts';
import {hasReservationCapacity} from '../../src/lib/validation/reservation-capacity.ts';
import {toMinorUnits} from '../../src/features/payments/core/currency.ts';
import {providerEnabled} from '../../src/features/payments/core/config.ts';
import {hasRequiredRole} from '../../src/lib/auth/permissions.ts';

test('percent discounts are rounded and capped by subtotal', () => {
  assert.equal(calculateDiscount(19.99, 'PERCENT', 10), 2);
  assert.equal(calculateDiscount(4, 'PERCENT', 100), 4);
});

test('fixed discounts are capped by subtotal', () => {
  assert.equal(calculateDiscount(8, 'FIXED', 12), 8);
});

test('order total subtracts discount and adds delivery', () => {
  assert.equal(calculateOrderTotal(20, 2.5, 2.99), 20.49);
  assert.equal(calculateOrderTotal(25, 0, 0), 25);
});

test('money rounds decimal floating point values consistently', () => {
  assert.equal(roundMoney(0.1 + 0.2), 0.3);
});

test('quantity is clamped to the supported 1..99 range', () => {
  assert.equal(normalizeQuantity(0), 1);
  assert.equal(normalizeQuantity(3.9), 3);
  assert.equal(normalizeQuantity(100), 99);
});

test('invalid financial inputs are rejected', () => {
  assert.throws(() => calculateDiscount(-1, 'FIXED', 1), RangeError);
  assert.throws(() => calculateDiscount(10, 'PERCENT', 101), RangeError);
  assert.throws(() => calculateOrderTotal(10, 11, 0), RangeError);
  assert.throws(() => normalizeQuantity(Number.NaN), TypeError);
});


test('reservation date-time validation rejects malformed and impossible values', () => {
  const now = new Date('2030-01-01T00:00:00Z');
  assert.equal(parseFutureReservationDateTime('2030-02-30', '12:00', now, 'UTC'), null);
  assert.equal(parseFutureReservationDateTime('2030-02-01', '25:00', now, 'UTC'), null);
  assert.equal(parseFutureReservationDateTime('2030-01-01', '00:00', now, 'UTC'), null);
  assert.equal(parseFutureReservationDateTime('2030-02-01', '12:30', now, 'UTC')?.getUTCHours(), 12);
});

test('admin permissions require an explicit ADMIN role', () => {
  assert.equal(hasRequiredRole('ADMIN', 'ADMIN'), true);
  assert.equal(hasRequiredRole('STAFF', 'ADMIN'), false);
  assert.equal(hasRequiredRole('CUSTOMER', 'ADMIN'), false);
  assert.equal(hasRequiredRole(undefined, 'ADMIN'), false);
});

import {absoluteLocalizedUrl, buildLanguageUrls, localizedPath, serializeJsonLd} from '../../src/lib/seo/url.ts';

test('localized URLs follow as-needed locale prefix policy', () => {
  assert.equal(localizedPath('/', 'en', 'en'), '/');
  assert.equal(localizedPath('/menu', 'en', 'en'), '/menu');
  assert.equal(localizedPath('/menu', 'fa', 'en'), '/fa/menu');
  assert.equal(localizedPath('menu', 'ja', 'en'), '/ja/menu');
  assert.equal(absoluteLocalizedUrl('https://example.test/', '/reserve', 'it', 'en'), 'https://example.test/it/reserve');
});

test('hreflang URLs include each locale and x-default without duplicate slashes', () => {
  const urls = buildLanguageUrls('https://example.test/', '/blog/post', ['en', 'fa', 'it'], 'en');
  assert.equal(urls.en, 'https://example.test/blog/post');
  assert.equal(urls.fa, 'https://example.test/fa/blog/post');
  assert.equal(urls.it, 'https://example.test/it/blog/post');
  assert.equal(urls['x-default'], urls.en);
});

test('JSON-LD serialization neutralizes HTML parser metacharacters', () => {
  const serialized = serializeJsonLd({name: '</script><script>alert(1)</script>', amp: 'a&b'});
  assert.equal(serialized.includes('</script>'), false);
  assert.equal(serialized.includes('<script>'), false);
  assert.equal(serialized.includes('\\u003c/script\\u003e'), true);
  assert.equal(serialized.includes('a\\u0026b'), true);
});


test('reservation times respect the configured time zone and reject DST gaps', () => {
  const now = new Date('2030-01-01T00:00:00Z');
  const vienna = parseFutureReservationDateTime('2030-02-01', '12:30', now, 'Europe/Vienna');
  assert.ok(vienna);
  assert.equal(vienna.toISOString(), '2030-02-01T11:30:00.000Z');
  assert.equal(parseFutureReservationDateTime('2030-03-31', '02:30', now, 'Europe/Vienna'), null);
});

test('reservation capacity counts overlapping guests and permits adjacent slots', () => {
  const candidateStart = new Date('2030-02-01T12:00:00Z');
  const existing = [{start: new Date('2030-02-01T11:30:00Z'), guests: 4}];
  assert.equal(hasReservationCapacity({candidateStart, candidateGuests: 5, capacity: 10, durationMinutes: 90, existing}), true);
  assert.equal(hasReservationCapacity({candidateStart, candidateGuests: 7, capacity: 10, durationMinutes: 90, existing}), false);
  assert.equal(hasReservationCapacity({candidateStart: new Date('2030-02-01T13:30:00Z'), candidateGuests: 7, capacity: 10, durationMinutes: 90, existing}), true);
});


test('payment amounts use ISO currency minor-unit precision', () => {
  assert.equal(toMinorUnits(12.34, 'EUR'), 1234);
  assert.equal(toMinorUnits(12, 'JPY'), 12);
  assert.equal(toMinorUnits(12.345, 'KWD'), 12345);
  assert.throws(() => toMinorUnits(-1, 'EUR'), RangeError);
  assert.throws(() => toMinorUnits(1, 'BADCODE'), TypeError);
});


test('mock payment provider cannot be enabled in production', () => {
  const oldNodeEnv = process.env.NODE_ENV;
  const oldMockEnabled = process.env.PAYMENT_MOCK_ENABLED;
  try {
    process.env.NODE_ENV = 'production';
    process.env.PAYMENT_MOCK_ENABLED = 'true';
    assert.equal(providerEnabled('MOCK'), false);
    process.env.NODE_ENV = 'development';
    assert.equal(providerEnabled('MOCK'), true);
  } finally {
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNodeEnv;
    if (oldMockEnabled === undefined) delete process.env.PAYMENT_MOCK_ENABLED; else process.env.PAYMENT_MOCK_ENABLED = oldMockEnabled;
  }
});
