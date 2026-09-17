'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

export async function markMessageReadAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const next = String(formData.get('next')) === 'true';
  if (!id) return;

  await db.contactMessage.update({where: {id}, data: {isRead: next}});
  revalidatePath('/admin/messages');
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db.contactMessage.delete({where: {id}});
  revalidatePath('/admin/messages');
}