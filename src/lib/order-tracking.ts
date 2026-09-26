import 'server-only';

import crypto from 'node:crypto';

/**
 * Generates a cryptographically secure tracking token.
 *
 * 32 random bytes = 256 bits of entropy.
 * The raw token is safe to put in a URL.
 */
export function generateTrackingToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Hashes a tracking token before storing it in the database.
 *
 * The raw token should never be persisted.
 */
export function hashTrackingToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token, 'utf8')
    .digest('hex');
}

/**
 * Generates the public tracking token and its database hash.
 *
 * The raw token is returned only to the caller that needs
 * to give it to the customer.
 */
export function createTrackingCredentials() {
  const token = generateTrackingToken();

  return {
    token,
    tokenHash: hashTrackingToken(token),
  };
}