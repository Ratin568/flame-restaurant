export type AppRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

/** Explicit allow-list check; STAFF is not implicitly an administrator. */
export function hasRequiredRole(actual: string | null | undefined, required: AppRole): boolean {
  return actual === required;
}
