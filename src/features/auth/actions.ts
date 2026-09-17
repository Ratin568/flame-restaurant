'use server';

import {headers} from 'next/headers';
import {db} from '@/lib/db';
import {hashPassword, verifyPassword} from '@/lib/auth/password';
import {createSession, destroySession} from '@/lib/auth/session';
import {redirect} from '@/lib/redirects';
import {rateLimit, getClientIp} from '@/lib/rate-limit';
import {sendWelcomeEmail} from '@/lib/email-templates';
import {loginSchema, registerSchema} from './schemas';
import {routing, type Locale} from '@/i18n/routing';

export type AuthFormState = {error?: string};

function readLocale(formData: FormData): Locale {
  const raw = formData.get('locale');
  const valid = typeof raw === 'string' && (routing.locales as readonly string[]).includes(raw);
  return valid ? (raw as Locale) : routing.defaultLocale;
}

async function checkAuthRateLimit(): Promise<boolean> {
  const hdrs = await headers();
  const rl = await rateLimit(`auth:${getClientIp(hdrs)}`, 5, 300); // 🚦 ۵ تلاش در ۵ دقیقه
  return rl.allowed;
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await checkAuthRateLimit())) return {error: 'tooManyAttempts'};
  const locale = readLocale(formData);

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const paths = parsed.error.issues.map((i) => String(i.path[0]));
    if (paths.includes('confirmPassword')) return {error: 'passwordMismatch'};
    if (paths.includes('password')) return {error: 'passwordTooShort'};
    if (paths.includes('name')) return {error: 'nameTooShort'};
    if (paths.includes('email')) return {error: 'invalidEmail'};
    return {error: 'generic'};
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({where: {email}});
  if (existing) return {error: 'emailTaken'};

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {email, name: parsed.data.name, passwordHash},
  });

  await createSession({userId: user.id, email: user.email, name: user.name, role: user.role});

  // ایمیل خوش‌آمد — fire-and-forget؛ هرگز مسیر ثبت‌نام را کند یا می‌شکند
  void sendWelcomeEmail(user.email, user.name);

  redirect('/account', locale);
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await checkAuthRateLimit())) return {error: 'tooManyAttempts'};
  const locale = readLocale(formData);

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return {error: 'invalidCredentials'};

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({where: {email}});
  if (!user) return {error: 'invalidCredentials'}; // پیام عمداً کلی — نشتی اطلاعات ندارد

  const valid = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!valid) return {error: 'invalidCredentials'};

  await createSession({userId: user.id, email: user.email, name: user.name, role: user.role});
  redirect('/account', locale);
}

export async function logoutAction(locale: Locale): Promise<void> {
  await destroySession();
  redirect('/', locale);
}