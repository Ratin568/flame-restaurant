'use server';

import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';
import {z} from 'zod';

export type ReservationFormState = {status?: 'success' | 'error'};

const reservationSchema = z.object({
  branchId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  guests: z.coerce.number().int().min(1).max(20),
  notes: z.string().trim().max(500).optional(),
});

export async function createReservationAction(
  _prev: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const parsed = reservationSchema.safeParse({
    branchId: formData.get('branchId'),
    date: formData.get('date'),
    time: formData.get('time'),
    guests: formData.get('guests'),
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) return {status: 'error'};

  // تاریخ + ساعت → DateTime
  const date = new Date(`${parsed.data.date}T${parsed.data.time}:00`);
  if (Number.isNaN(date.getTime())) return {status: 'error'};
  if (date < new Date()) return {status: 'error'}; // گذشته نه!

  const branch = await db.branch.findUnique({where: {id: parsed.data.branchId}});
  if (!branch || !branch.isActive) return {status: 'error'};

  const session = await getSession();

  await db.reservation.create({
    data: {
      userId: session?.userId ?? null, // مهمان هم می‌تواند رزرو کند
      branchId: branch.id,
      date,
      guests: parsed.data.guests,
      notes: parsed.data.notes ?? null,
    },
  });

  return {status: 'success'};
}