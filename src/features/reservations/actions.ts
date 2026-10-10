'use server';

import {db} from '@/lib/db';
import {getSession} from '@/lib/auth/session';
import {z} from 'zod';
import {Prisma} from '@/generated/prisma/client';
import {auditLog} from '@/lib/audit';
import {sendBusinessEventEmail} from '@/lib/email-templates';
import {parseFutureReservationDateTime} from '@/lib/validation/reservation-date-time';
import {hasReservationCapacity} from '@/lib/validation/reservation-capacity';

export type ReservationFormState = {status?: 'success' | 'error'};

const reservationSchema = z.object({
  branchId: z.string().min(1),
  date: z.string(),
  time: z.string(),
  guests: z.coerce.number().int().min(1).max(20),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
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
    email: formData.get('email') || undefined,
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) return {status: 'error'};

  // Parse local restaurant time strictly; malformed/impossible/past slots fail closed.
  const date = parseFutureReservationDateTime(parsed.data.date, parsed.data.time);
  if (!date) return {status: 'error'};

  const branch = await db.branch.findUnique({where: {id: parsed.data.branchId}});
  if (!branch || !branch.isActive) return {status: 'error'};

  const session = await getSession();

  try {
    const contactEmail = parsed.data.email || session?.email || null;
    const reservation = await db.$transaction(async (tx) => {
      const exactSlot = await tx.reservation.findFirst({
        where: {branchId: branch.id, date, status: {notIn: ['CANCELLED', 'NO_SHOW']}},
        select: {id: true},
      });
      if (exactSlot) throw new Error('RESERVATION_SLOT_TAKEN');

      const durationMs = branch.reservationDurationMinutes * 60_000;
      const overlapping = await tx.reservation.findMany({
        where: {
          branchId: branch.id,
          status: {notIn: ['CANCELLED', 'NO_SHOW']},
          date: {gt: new Date(date.getTime() - durationMs), lt: new Date(date.getTime() + durationMs)},
        },
        select: {date: true, guests: true},
      });
      if (!hasReservationCapacity({
        candidateStart: date,
        candidateGuests: parsed.data.guests,
        capacity: branch.reservationCapacity,
        durationMinutes: branch.reservationDurationMinutes,
        existing: overlapping.map(({date, guests}) => ({start: date, guests})),
      })) throw new Error('RESERVATION_CAPACITY_EXCEEDED');

      return tx.reservation.create({
        data: {
          userId: session?.userId ?? null, // Ù…Ù‡Ù…Ø§Ù† Ù‡Ù… Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø±Ø²Ø±Ùˆ Ú©Ù†Ø¯
          branchId: branch.id,
          date,
          guests: parsed.data.guests,
          contactEmail,
          notes: parsed.data.notes ?? null,
        },
      });
    }, {isolationLevel: Prisma.TransactionIsolationLevel.Serializable});
    await auditLog('reservation.created', {branchId: branch.id, date: date.toISOString(), guests: parsed.data.guests});
    if (contactEmail) {
      void sendBusinessEventEmail(contactEmail, {
        eventKey: 'reservation-created', title: 'Reservation request received',
        message: `We received your reservation request for ${new Intl.DateTimeFormat('en', {dateStyle: 'medium', timeStyle: 'short', timeZone: process.env.RESTAURANT_TIME_ZONE || 'UTC'}).format(date)}. The request is pending confirmation.`,
        reference: reservation.id,
      }).then((result) => { if (!result.ok) console.error('[notification] reservation email failed', result.error); });
    }
    return {status: 'success'};
  } catch (error) {
    // Unique/serialization conflicts and occupied slots fail closed for the caller.
    console.warn('[reservation] creation rejected', error instanceof Error ? error.message : 'unknown error');
    return {status: 'error'};
  }
}
