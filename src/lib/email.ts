import 'server-only';

import {Resend} from 'resend';
import nodemailer, {type Transporter} from 'nodemailer';
import type {ReactNode} from 'react';

export type EmailProvider = 'resend' | 'gmail';

export type EmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

const provider = (process.env.EMAIL_PROVIDER ?? 'gmail').toLowerCase() as EmailProvider;

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.EMAIL_FROM ?? 'Flame <onboarding@resend.dev>';

const gmailUser = process.env.GMAIL_SMTP_USER;
const gmailAppPassword = process.env.GMAIL_SMTP_APP_PASSWORD;
const gmailFrom = process.env.GMAIL_FROM ?? gmailUser;

if (provider !== 'resend' && provider !== 'gmail') {
  throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}. Use 'resend' or 'gmail'.`);
}

/**
 * آیا سرویس ایمیل انتخاب‌شده تنظیم شده؟
 */
export const emailEnabled =
  provider === 'resend'
    ? Boolean(resendApiKey)
    : Boolean(gmailUser && gmailAppPassword);

let gmailTransporter: Transporter | null = null;

/**
 * ساخت و نگهداری Transporter مربوط به Gmail.
 */
function getGmailTransporter(): Transporter {
  if (gmailTransporter) {
    return gmailTransporter;
  }

  if (!gmailUser || !gmailAppPassword) {
    throw new Error(
      'Gmail email provider is selected but GMAIL_SMTP_USER or GMAIL_SMTP_APP_PASSWORD is missing.',
    );
  }

  gmailTransporter = nodemailer.createTransport({
    host: process.env.GMAIL_SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.GMAIL_SMTP_PORT ?? '465'),
    secure: (process.env.GMAIL_SMTP_SECURE ?? 'true').toLowerCase() === 'true',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  return gmailTransporter;
}

/**
 * ارسال ایمیل از طریق Provider انتخاب‌شده.
 *
 * Providerها عمداً پشت یک API مشترک نگه داشته شده‌اند تا مشتری بتواند
 * فقط با تغییر ENV بین Resend و Gmail جابه‌جا شود.
 */
export async function sendEmail({
  to,
  subject,
  content,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  content: ReactNode;
  idempotencyKey?: string;
}): Promise<EmailResult> {
  if (!emailEnabled) {
    console.log(
      `📧 [email disabled] provider=${provider} to=${to} subject="${subject}"${
        idempotencyKey ? ` idempotencyKey="${idempotencyKey}"` : ''
      }`,
    );

    return {
      ok: false,
      error: 'Email provider is not configured.',
    };
  }

  try {
    /**
     * ─────────────────────────────────────────────
     * Resend
     * ─────────────────────────────────────────────
     */
    if (provider === 'resend') {
      if (!resendApiKey) {
        return {
          ok: false,
          error: 'RESEND_API_KEY is missing.',
        };
      }

      const resend = new Resend(resendApiKey);

      const {data, error} = await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        react: content,
      });

      if (error) {
        console.error('📧 Resend email error:', error);

        return {
          ok: false,
          error: error.message ?? 'Resend failed to send email.',
        };
      }

      console.log(
        `📧 Resend email sent: ${data?.id ?? 'unknown-id'}${
          idempotencyKey ? ` (${idempotencyKey})` : ''
        }`,
      );

      return {
        ok: true,
        id: data?.id,
      };
    }

    /**
     * ─────────────────────────────────────────────
     * Gmail SMTP
     * ─────────────────────────────────────────────
     */
    const transporter = getGmailTransporter();

    const info = await transporter.sendMail({
      from: gmailFrom,
      to,
      subject,
      html: await renderEmailHtml(content),
    });

    console.log(
      `📧 Gmail email sent: ${info.messageId}${
        idempotencyKey ? ` (${idempotencyKey})` : ''
      }`,
    );

    return {
      ok: true,
      id: info.messageId,
    };
  } catch (error) {
    console.error(`📧 ${provider} email failed:`, error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown email provider error.',
    };
  }
}

/**
 * React Email components are rendered by @react-email/render at runtime.
 *
 * Dynamic import keeps the provider layer independent from the template layer.
 */
async function renderEmailHtml(content: ReactNode): Promise<string> {
  const {render} = await import('@react-email/render');

  return render(content);
}