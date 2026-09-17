import {getTranslations} from 'next-intl/server';
import {Stars} from './stars';
import {ReviewForm} from './review-form';
import type {ProductReviewSummary} from '@/features/reviews/queries';

export async function ReviewsSection({
  productId,
  categorySlug,
  slug,
  summary,
  locale,
}: {
  productId: string;
  categorySlug: string;
  slug: string;
  summary: ProductReviewSummary;
  locale: string;
}) {
  const t = await getTranslations('reviews');

  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-black">{t('title')}</h2>

        {summary.count > 0 && summary.average != null && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={summary.average} className="text-sm" />
            <strong className="text-foreground">{summary.average}</strong>
            <span>· {t('basedOn', {count: summary.count})}</span>
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* لیست نظرات */}
        <div className="space-y-4">
          {summary.count === 0 && (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {t('empty')}
            </p>
          )}

          {summary.items.map((review) => (
            <article key={review.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {review.userName.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold">{review.userName}</span>
                <Stars value={review.rating} className="text-xs" />
                <span className="ms-auto text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(review.createdAt)}
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              )}
            </article>
          ))}
        </div>

        {/* فرم ثبت */}
        <div className="h-fit">
          <ReviewForm productId={productId} categorySlug={categorySlug} slug={slug} />
        </div>
      </div>
    </section>
  );
}