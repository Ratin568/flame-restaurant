-- Query index for branch/time/status reservation collision checks.
-- Non-destructive: existing reservation records are preserved.
CREATE INDEX IF NOT EXISTS "reservations_branchId_date_status_idx"
  ON "reservations"("branchId", "date", "status");

-- Optional contact email enables reservation lifecycle notifications without breaking existing rows.
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;

-- Optional customer email supports order/payment notifications for guest checkout.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;

-- Branch reservation controls use conservative defaults and preserve existing branches.
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "reservationCapacity" INTEGER NOT NULL DEFAULT 40;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "reservationDurationMinutes" INTEGER NOT NULL DEFAULT 90;

-- Supporting indexes for availability/publish filtering and sitemap refreshes.
CREATE INDEX IF NOT EXISTS "products_isAvailable_updatedAt_idx" ON "products"("isAvailable", "updatedAt");
CREATE INDEX IF NOT EXISTS "blog_posts_isPublished_updatedAt_idx" ON "blog_posts"("isPublished", "updatedAt");
