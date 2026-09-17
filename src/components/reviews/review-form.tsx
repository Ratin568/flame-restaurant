'use client';

import {useActionState, useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {submitReviewAction, type ReviewFormState} from '@/features/reviews/actions';

const initialState: ReviewFormState = {};

export function ReviewForm({
  productId,
  categorySlug,
  slug,
}: {
  productId: string;
  categorySlug: string;
  slug: string;
}) {
  const t = useTranslations('reviews');
  const tAuth = useTranslations('auth');
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);

  const [userName, setUserName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', {cache: 'no-store'})
      .then((r) => r.json())
      .then((data) => {
        if (active) setUserName(data.user?.name ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded) return <div className="h-32 animate-pulse rounded-lg bg-muted" aria-hidden />;

  // لاگین نیست → دعوت به ورود
  if (!userName) {
    return (
      <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        {t('loginPrompt')}{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {tAuth('loginCta')}
        </Link>
      </p>
    );
  }

  // ثبت شد یا تکراری → پیام (فرم مخفی)
  if (state?.status === 'submitted' || state?.status === 'already') {
    return (
      <p
        className={`rounded-lg px-4 py-3 text-sm ${
          state.status === 'submitted'
            ? 'bg-green-500/10 text-green-600'
            : 'bg-yellow-500/10 text-yellow-600'
        }`}
      >
        {state.status === 'submitted' ? t('submitted') : t('already')}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <span className="text-sm font-medium">{t('rating')}</span>
        <div className="mt-1 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              aria-label={`${i} / 5`}
              className={`text-2xl transition-colors ${
                i <= (hover || rating) ? 'text-yellow-400' : 'text-muted-foreground/30'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <textarea
        name="comment"
        rows={3}
        required
        minLength={2}
        maxLength={1000}
        placeholder={t('commentPlaceholder')}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {state?.status === 'error' && <p className="text-sm text-destructive">{t('error')}</p>}

      <Button type="submit" disabled={pending || rating === 0}>
        {pending ? '...' : t('submit')}
      </Button>
    </form>
  );
}