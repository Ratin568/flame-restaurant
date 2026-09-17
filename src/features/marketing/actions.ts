'use server';

import {headers} from 'next/headers';
import {db} from '@/lib/db';
import {rateLimit, getClientIp} from '@/lib/rate-limit';
import {z} from 'zod';

export type NewsletterState = {status?: 'ok' | 'already' | 'error'};

const emailSchema = z.string().trim().toLowerCase().email().max(255);

async function checkFormRateLimit(): Promise<boolean> {
  const hdrs = await headers();
  const rl = await rateLimit(`form:${getClientIp(hdrs)}`, 5, 600); // 🚦 ۵ در ۱۰ دقیقه
  return rl.allowed;
}

export async function subscribeAction(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  if (!(await checkFormRateLimit())) return {status: 'error'};

  const locale = String(formData.get('locale') ?? 'en');
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return {status: 'error'};

  try {
    const existing = await db.newsletterSubscriber.findUnique({where: {email: parsed.data}});
    if (existing) return {status: 'already'};

    await db.newsletterSubscriber.create({data: {email: parsed.data, locale}});
    return {status: 'ok'};
  } catch {
    return {status: 'error'};
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(255),
  message: z.string().trim().min(10).max(2000),
});

export async function sendMessageAction(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  if (!(await checkFormRateLimit())) return {status: 'error'};

  // 🍯 Honeypot: پر بودن = بات → جواب موفقیت دروغین، بدون ذخیره
  if (String(formData.get('website') ?? '').trim() !== '') {
    return {status: 'ok'};
  }

  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });
  if (!parsed.success) return {status: 'error'};

  try {
    await db.contactMessage.create({data: parsed.data});
    return {status: 'ok'};
  } catch {
    return {status: 'error'};
  }
}