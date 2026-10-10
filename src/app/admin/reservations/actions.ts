'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {auditLog} from '@/lib/audit';
import {sendBusinessEventEmail} from '@/lib/email-templates';

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

  const existing = await db.reservation.findUnique({where: {id}, select: {contactEmail: true, date: true, status: true, user: {select: {email: true}}}});
  if (!existing) return;
  const result = await db.reservation.updateMany({where: {id, status: {not: status}}, data: {status}});
  if (result.count !== 1) return;
  await auditLog('reservation.status.update', {reservationId: id, status});
  const email = existing.contactEmail || existing.user?.email;
  if (email && status !== 'PENDING') {
    const title = status === 'CONFIRMED' ? 'Reservation confirmed' : status === 'CANCELLED' ? 'Reservation cancelled' : status === 'SEATED' ? 'Your table is ready' : 'Reservation update';
    void sendBusinessEventEmail(email, {eventKey: `reservation-${status.toLowerCase()}`, title, message: `Your Flame reservation status is now ${status.toLowerCase()}.`, reference: id})
      .then((delivery) => { if (!delivery.ok) console.error('[notification] reservation status email failed', delivery.error); });
  }

  revalidatePath('/admin/reservations');
}