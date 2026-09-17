import {hash, verify} from '@node-rs/argon2';

// Argon2id — برنده مسابقه Password Hashing Competition
// salt خودکار در هر هش تولید می‌شود
export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch {
    return false; // هش خراب = ورود ناموفق، نه کرش سرور
  }
}