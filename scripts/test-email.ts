import 'dotenv/config';
import {Resend} from 'resend';

const to = process.argv[2] || process.env.EMAIL_TEST_TO;
const apiKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.EMAIL_FROM?.trim() || 'Flame <onboarding@resend.dev>';

if (!apiKey) {
  console.error('Missing RESEND_API_KEY in .env');
  process.exit(1);
}

if (!to) {
  console.error('Usage: npm run email:test -- your@email.com');
  process.exit(1);
}

const resend = new Resend(apiKey);
const {data, error} = await resend.emails.send({
  from,
  to: [to],
  subject: 'Flame email service test',
  html: '<h1>🔥 Flame</h1><p>Your Flame transactional email configuration is working.</p>',
});

if (error) {
  console.error('Resend error:', error);
  process.exit(1);
}

console.log(`Email accepted by Resend. Message ID: ${data?.id ?? 'unknown'}`);
