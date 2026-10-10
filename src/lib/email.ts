import 'server-only';
import {Resend} from 'resend';
import nodemailer from 'nodemailer';
import type {Transporter} from 'nodemailer';
import type {ReactNode} from 'react';

export type EmailProvider = 'resend' | 'gmail';
export type EmailResult = {ok: boolean; error?: string; messageId?: string};

const provider = (process.env.EMAIL_PROVIDER ?? 'gmail').toLowerCase() as EmailProvider;
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.EMAIL_FROM ?? 'Flame <onboarding@resend.dev>';
const gmailUser = process.env.GMAIL_SMTP_USER;
const gmailAppPassword = process.env.GMAIL_SMTP_APP_PASSWORD;
const gmailFrom = process.env.GMAIL_FROM ?? gmailUser;

if (provider !== 'resend' && provider !== 'gmail') {
  throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}. Use 'resend' or 'gmail'.`);
}

/** Ø¢ÛŒØ§ Ø³Ø±ÙˆÛŒØ³ Ø§ÛŒÙ…ÛŒÙ„ Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ ØªÙ†Ø¸ÛŒÙ… Ø´Ø¯Ù‡ØŸ */
export const emailEnabled = provider === 'resend' ? Boolean(resendApiKey) : Boolean(gmailUser && gmailAppPassword);

let gmailTransporter: Transporter | null = null;

function getGmailTransporter(): Transporter {
  if (gmailTransporter) return gmailTransporter;
  if (!gmailUser || !gmailAppPassword) {
    throw new Error('Gmail email provider is selected but GMAIL_SMTP_USER or GMAIL_SMTP_APP_PASSWORD is missing.');
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
 * Ø§Ø±Ø³Ø§Ù„ Ø§ÛŒÙ…ÛŒÙ„ Ø§Ø² Ø·Ø±ÛŒÙ‚ Provider Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡.
 * ProviderÙ‡Ø§ Ø¹Ù…Ø¯Ø§Ù‹ Ù¾Ø´Øª ÛŒÚ© API Ù…Ø´ØªØ±Ú© Ù†Ú¯Ù‡ Ø¯Ø§Ø´ØªÙ‡ Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯ ØªØ§ Ù…Ø´ØªØ±ÛŒ Ø¨ØªÙˆØ§Ù†Ø¯
 * ÙÙ‚Ø· Ø¨Ø§ ØªØºÛŒÛŒØ± ENV Ø¨ÛŒÙ† Resend Ùˆ Gmail Ø¬Ø§Ø¨Ù‡â€ŒØ¬Ø§ Ø´ÙˆØ¯.
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
    console.error(`[email] not sent: provider=${provider} is not configured`);
    return {ok: false, error: `Email provider ${provider} is not configured`};
  }
  // Gmail SMTP does not provide provider-side idempotency. Keep the key available
  // for correlation; callers must not assume it deduplicates SMTP submissions.
  void idempotencyKey;

  try {
    if (provider === 'resend') {
      if (!resendApiKey) return {ok: false, error: 'RESEND_API_KEY is missing'};
      const resend = new Resend(resendApiKey);
      const {error} = await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        react: content,
      });

      if (error) {
        console.error('[email] Resend delivery failed:', error);
        return {ok: false, error: String(error.message ?? 'Resend delivery failed')};
      }

      return {ok: true};
    }

    const transporter = getGmailTransporter();
    const info = await transporter.sendMail({
      from: gmailFrom,
      to,
      subject,
      html: await renderEmailHtml(content),
    });

    console.log(`[email] Gmail delivery accepted: ${info.messageId}`);
    return {ok: true, messageId: info.messageId};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown email delivery error';
    console.error(`[email] ${provider} delivery failed:`, message);
    return {ok: false, error: message};
  }
}

/**
 * React Email components are rendered by @react-email/render at runtime.
 * The dynamic import keeps the provider layer independent from the template layer.
 */
async function renderEmailHtml(content: ReactNode): Promise<string> {
  const {render} = await import('@react-email/render');
  return render(content);
}
