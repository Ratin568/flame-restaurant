import 'server-only';
import {createHash, randomBytes} from 'node:crypto';

export function createSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function hashSecureToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
