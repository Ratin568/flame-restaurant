import Link from 'next/link';
import {Trash2} from 'lucide-react';
import {db} from '@/lib/db';
import {Stars} from '@/components/reviews/stars';
import {deleteReviewAction, setReviewApprovalAction} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: {createdAt: 'desc'},
    take: 100,
    include: {
      user: {select: {name: true, email: true}},
      product: {
        select: {
          slug: true,
          category: {select: {slug: true}},
          translations: {select: {locale: true, name: true}},
        },
      },
    },
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'short'}).format(d);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black">Reviews</h1>
        {pendingCount > 0 && (
          <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-600">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {reviews.length === 0 && (
          <p className="rounded-xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            No reviews yet.
          </p>
        )}

        {reviews.map((review) => {
          const productName =
            review.product.translations.find((t) => t.locale === 'en')?.name ??
            review.product.slug;
          const categorySlug = review.product.category.slug;

          return (
            <div key={review.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Stars value={review.rating} className="text-sm" />
                <Link
                  href={`/menu/${categorySlug}/${review.product.slug}`}
                  className="text-sm font-semibold transition-colors hover:text-primary"
                >
                  {productName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  by {review.user.name} ({review.user.email})
                </span>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    review.isApproved
                      ? 'bg-green-500/15 text-green-600'
                      : 'bg-yellow-500/15 text-yellow-600'
                  }`}
                >
                  {review.isApproved ? 'Approved' : 'Pending'}
                </span>

                <span className="ms-auto text-xs text-muted-foreground">{fmtDate(review.createdAt)}</span>
              </div>

              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <form action={setReviewApprovalAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="next" value={String(!review.isApproved)} />
                  <button
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 ${
                      review.isApproved
                        ? 'border border-border text-muted-foreground'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {review.isApproved ? 'Un-approve' : '✓ Approve'}
                  </button>
                </form>

                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <button
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                    aria-label="Delete review"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}