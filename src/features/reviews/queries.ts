import {db} from '@/lib/db';

export type ProductReviewSummary = {
  average: number | null;
  count: number;
  items: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    userName: string;
  }[];
};

/** فقط نظرات تاییدشده — برای نمایش عمومی */
export async function getApprovedReviews(productId: string): Promise<ProductReviewSummary> {
  const where = {productId, isApproved: true};

  const [agg, items] = await Promise.all([
    db.review.aggregate({_avg: {rating: true}, _count: {_all: true}, where}),
    db.review.findMany({
      where,
      orderBy: {createdAt: 'desc'},
      take: 20,
      include: {user: {select: {name: true}}},
    }),
  ]);

  return {
    average: agg._avg.rating != null ? Math.round(agg._avg.rating * 10) / 10 : null,
    count: agg._count._all,
    items: items.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user.name,
    })),
  };
}