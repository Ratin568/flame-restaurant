'use client';

import {useActionState, useState} from 'react';
import {useTranslations} from 'next-intl';
import {CalendarCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {createReservationAction, type ReservationFormState} from './actions';

const initialState: ReservationFormState = {};

// ساعات کاری ۱۱:۰۰ تا ۲۲:۳۰ — هر ۳۰ دقیقه
const TIMES: string[] = [];
for (let h = 11; h <= 22; h++) {
  TIMES.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 22) TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

export function ReservationForm({branches}: {branches: {id: string; slug: string}[]}) {
  const t = useTranslations('reserve');
  const [state, formAction, pending] = useActionState(createReservationAction, initialState);

  const today = new Date().toISOString().split('T')[0];

  if (state?.status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-12 text-center">
        <CalendarCheck className="size-12 text-green-500" />
        <p className="font-semibold text-green-600">{t('success')}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">{t('branch')}</label>
          <select name="branchId" required className={`${inputCls} mt-1.5`}>
            <option value="">{t('selectBranch')}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.slug}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">{t('guests')}</label>
          <select name="guests" required defaultValue="2" className={`${inputCls} mt-1.5`}>
            {Array.from({length: 12}, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? t('guest') : t('guests_suffix')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">{t('date')}</label>
          <Input name="date" type="date" required min={today} className="mt-1.5" />
        </div>
        <div>
          <label className="text-sm font-medium">{t('time')}</label>
          <select name="time" required className={`${inputCls} mt-1.5`}>
            <option value="">{t('selectTime')}</option>
            {TIMES.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{t('notes')}</label>
        <Input name="notes" placeholder={t('notesPlaceholder')} className="mt-1.5" />
      </div>

      {state?.status === 'error' && (
        <p className="text-sm text-destructive">{t('error')}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? '...' : `🔥 ${t('submit')}`}
      </Button>
    </form>
  );
}