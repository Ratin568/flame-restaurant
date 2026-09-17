'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';

async function guard() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');
}

const STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'] as const;
type Status = (typeof STATUSES)[number];

export async function setReservationStatusAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get('id') ?? '');
  const status = STATUSES.find((s) => s === formData.get('status'));
  if (!id || !status) return;

  await db.reservation.update({where: {id}, data: {status}});

  revalidatePath('/admin/reservations');
}