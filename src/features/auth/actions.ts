'use server';

import {headers} from 'next/headers';
import {db} from '@/lib/db';
import {hashPassword, verifyPassword} from '@/lib/auth/password';
import {createSession, revokeAllUserSessions, revokeCurrentSession, revokeSessionById, getSession} from '@/lib/auth/session';
import {redirect} from '@/lib/redirects';
import {rateLimit, getClientIp} from '@/lib/rate-limit';
import {sendEmailVerificationEmail, sendPasswordResetEmail, sendSuspiciousLoginEmail, sendWelcomeEmail} from '@/lib/email-templates';
import {loginSchema, registerSchema} from './schemas';
import {routing, type Locale} from '@/i18n/routing';
import {createSecureToken, hashSecureToken} from '@/lib/auth/tokens';

export type AuthFormState = {error?: string; success?: string};

function readLocale(formData: FormData): Locale {
  const raw = formData.get('locale');
  return typeof raw === 'string' && (routing.locales as readonly string[]).includes(raw)
    ? raw as Locale
    : routing.defaultLocale;
}

async function authContext() {
  const h = await headers();
  return {ipAddress: getClientIp(h), userAgent: h.get('user-agent') || null};
}

async function checkAuthRateLimit(key = 'auth'): Promise<boolean> {
  const h = await headers();
  return (await rateLimit(`${key}:${getClientIp(h)}`, 5, 300)).allowed;
}

async function issueEmailVerification(userId: string, email: string, name: string, locale: Locale): Promise<boolean> {
  await db.emailVerificationToken.deleteMany({where: {userId, usedAt: null}});

  const raw = createSecureToken();
  const tokenHash = hashSecureToken(raw);
  await db.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const result = await sendEmailVerificationEmail(email, name, raw, locale);
  if (!result.ok) {
    // Do not leave a misleadingly "sent" state in the DB when the provider
    // rejected the message. The token is safe to regenerate via resend.
    await db.emailVerificationToken.deleteMany({where: {tokenHash}});
    console.error(`📧 Verification email failed for ${email}: ${result.error ?? 'unknown error'}`);
    return false;
  }

  return true;
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!(await checkAuthRateLimit())) return {error: 'tooManyAttempts'};

  const locale = readLocale(formData);
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const paths = parsed.error.issues.map(i => String(i.path[0]));
    if (paths.includes('confirmPassword')) return {error: 'passwordMismatch'};
    if (paths.includes('password')) return {error: 'passwordTooShort'};
    if (paths.includes('name')) return {error: 'nameTooShort'};
    if (paths.includes('email')) return {error: 'invalidEmail'};
    return {error: 'generic'};
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({where: {email}});

  // An email is considered a registered account only after verification.
  // Until then, allow the user to return to Register as many times as needed.
  // Reuse the same unverified user instead of creating duplicate records.
  let user;

  if (existing) {
    if (existing.emailVerifiedAt) return {error: 'emailAlreadyVerified'};

    user = await db.user.update({
      where: {id: existing.id},
      data: {
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
  } else {
    user = await db.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
  }

  const sent = await issueEmailVerification(user.id, user.email, user.name, locale);
  if (!sent) {
    return {error: 'emailDeliveryFailed'};
  }

  redirect(`/login?verification=sent`, locale);
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!(await checkAuthRateLimit())) return {error: 'tooManyAttempts'};

  const locale = readLocale(formData);
  const parsed = loginSchema.safeParse({email: formData.get('email'), password: formData.get('password')});
  if (!parsed.success) return {error: 'invalidCredentials'};

  const email = parsed.data.email.toLowerCase();
  const ctx = await authContext();
  const user = await db.user.findUnique({where: {email}});

  if (!user) {
    await db.loginHistory.create({
      data: {email, success: false, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent, reason: 'invalid_credentials'},
    });
    return {error: 'invalidCredentials'};
  }

  const valid = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!valid) {
    await db.loginHistory.create({
      data: {userId: user.id, email, success: false, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent, reason: 'invalid_credentials'},
    });
    return {error: 'invalidCredentials'};
  }

  if (!user.emailVerifiedAt) {
    await db.loginHistory.create({
      data: {userId: user.id, email, success: false, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent, reason: 'email_not_verified'},
    });
    return {error: 'emailNotVerified'};
  }

  const previous = await db.session.findFirst({
    where: {userId: user.id, revokedAt: null, expiresAt: {gt: new Date()}},
    orderBy: {lastUsedAt: 'desc'},
  });

  const suspicious = Boolean(
    previous &&
    ((previous.ipAddress && ctx.ipAddress && previous.ipAddress !== ctx.ipAddress) ||
      (previous.userAgent && ctx.userAgent && previous.userAgent !== ctx.userAgent)),
  );

  await db.loginHistory.create({
    data: {
      userId: user.id,
      email,
      success: true,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      reason: suspicious ? 'new_device_or_location' : null,
    },
  });

  await createSession({userId: user.id, email: user.email, name: user.name, role: user.role});

  if (suspicious) {
    void sendSuspiciousLoginEmail(
      user.email,
      user.name,
      ctx.ipAddress ?? 'Unknown',
      ctx.userAgent ?? 'Unknown',
      locale,
    ).then(result => {
      if (!result.ok) console.error(`📧 Suspicious-login email failed for ${user.email}: ${result.error ?? 'unknown error'}`);
    });
  }

  redirect('/account', locale);
}

export async function requestPasswordResetAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!(await checkAuthRateLimit('password-reset'))) return {error: 'tooManyAttempts'};

  const locale = readLocale(formData);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {error: 'invalidEmail'};

  const user = await db.user.findUnique({where: {email}});
  if (user) {
    await db.passwordResetToken.deleteMany({where: {userId: user.id, usedAt: null}});
    const raw = createSecureToken();
    const tokenHash = hashSecureToken(raw);
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const result = await sendPasswordResetEmail(user.email, user.name, raw, locale);
    if (!result.ok) {
      await db.passwordResetToken.deleteMany({where: {tokenHash}});
      console.error(`📧 Password-reset email failed for ${user.email}: ${result.error ?? 'unknown error'}`);
    }
  }

  // Always return the same response to avoid account enumeration.
  return {success: 'resetEmailSent'};
}

export async function resetPasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (password.length < 8) return {error: 'passwordTooShort'};
  if (password !== confirmPassword) return {error: 'passwordMismatch'};

  const record = await db.passwordResetToken.findUnique({
    where: {tokenHash: hashSecureToken(token)},
    include: {user: true},
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) return {error: 'invalidResetToken'};

  const now = new Date();
  await db.$transaction([
    db.user.update({where: {id: record.userId}, data: {passwordHash: await hashPassword(password)}}),
    db.passwordResetToken.update({where: {id: record.id}, data: {usedAt: now}}),
    db.passwordResetToken.deleteMany({where: {userId: record.userId, id: {not: record.id}}}),
    db.session.updateMany({where: {userId: record.userId, revokedAt: null}, data: {revokedAt: now}}),
  ]);

  return {success: 'passwordReset'};
}

export async function verifyEmailAction(token: string): Promise<'verified' | 'invalid' | 'already'> {
  const record = await db.emailVerificationToken.findUnique({
    where: {tokenHash: hashSecureToken(token)},
    include: {user: true},
  });
  if (!record) return 'invalid';
  if (record.usedAt) return 'already';
  if (record.expiresAt <= new Date()) return 'invalid';

  const now = new Date();
  await db.$transaction([
    db.user.update({where: {id: record.userId}, data: {emailVerifiedAt: now}}),
    db.emailVerificationToken.update({where: {id: record.id}, data: {usedAt: now}}),
    db.emailVerificationToken.deleteMany({where: {userId: record.userId, id: {not: record.id}}}),
  ]);

  void sendWelcomeEmail(record.user.email, record.user.name).then(result => {
    if (!result.ok) console.error(`📧 Welcome email failed for ${record.user.email}: ${result.error ?? 'unknown error'}`);
  });

  return 'verified';
}

export async function resendVerificationAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!(await checkAuthRateLimit('verification'))) return {error: 'tooManyAttempts'};

  const locale = readLocale(formData);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const user = await db.user.findUnique({where: {email}});

  if (user && !user.emailVerifiedAt) {
    const sent = await issueEmailVerification(user.id, user.email, user.name, locale);
    if (!sent) return {error: 'emailDeliveryFailed'};
  }

  // Do not reveal whether the address exists.
  return {success: 'verificationSent'};
}

export async function logoutAction(locale: Locale): Promise<void> {
  await revokeCurrentSession();
  redirect('/', locale);
}

export async function logoutAllDevicesAction(locale: Locale): Promise<void> {
  const session = await getSession();
  if (session) await revokeAllUserSessions(session.userId);
  redirect('/', locale);
}

export async function revokeDeviceSessionAction(sessionId: string): Promise<void> {
  const session = await getSession();
  if (!session || session.sessionId === sessionId) return;
  await revokeSessionById(session.userId, sessionId);
}
