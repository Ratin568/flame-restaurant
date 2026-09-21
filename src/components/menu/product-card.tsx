'use client';

import { useRouter } from '@/i18n/navigation';
import { Flame, Leaf, FlameKindling } from 'lucide-react';

import Button3D from '@/components/ui/button-3d';
import { formatPrice } from '@/lib/money';
import type { MenuProduct } from '@/features/menu/queries';

import styles from './product-card.module.css';

type Props = {
  product: MenuProduct;
  categorySlug: string;
  locale: string;

  index?: number;

  addToCartLabel: string;
  spicyLabel: string;
  veggieLabel: string;
  kcalLabel: string;
};

export function ProductCard({
  product,
  categorySlug,
  locale,
  index = 0,
  addToCartLabel,
  spicyLabel,
  veggieLabel,
  kcalLabel,
}: Props) {
  const router = useRouter();

  const productPath = `/menu/${categorySlug}/${product.slug}`;

  function openProduct() {
    router.push(productPath);
  }

  return (
    <article
      className={styles.card}
      style={
        {
          '--card-index': index,
        } as React.CSSProperties
      }
    >
      {/* =======================================================
          VISUAL
      ======================================================= */}

      <button
        type="button"
        className={styles.visual}
        onClick={openProduct}
        aria-label={product.name}
      >
        <div className={styles.visualNoise} />

        <div className={styles.visualGrid} />

        <span className={styles.productNumber}>
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className={styles.visualLabel}>
          FLAME / ORIGINAL
        </span>

        <div className={styles.visualOrb}>
          <span />
          <span />
          <span />
        </div>

        <div className={styles.visualIcon}>
          <FlameKindling
            strokeWidth={1}
            aria-hidden="true"
          />
        </div>

        {product.isFeatured && (
          <span className={styles.featured}>
            FEATURED
          </span>
        )}

        <span className={styles.viewIndicator}>
          VIEW
          <span>↗</span>
        </span>
      </button>

      {/* =======================================================
          INFORMATION
      ======================================================= */}

      <div className={styles.body}>
        <div className={styles.headingRow}>
          <button
            type="button"
            className={styles.nameButton}
            onClick={openProduct}
          >
            <span className={styles.categoryMarker}>
              MENU / {String(index + 1).padStart(2, '0')}
            </span>

            <h3>{product.name}</h3>
          </button>

          <span className={styles.price}>
            {formatPrice(product.price, locale)}
          </span>
        </div>

        <p className={styles.description}>
          {product.description}
        </p>

        <div className={styles.metaRow}>
          <div className={styles.badges}>
            {product.isSpicy && (
              <span className={styles.badge}>
                <Flame
                  size={12}
                  strokeWidth={1.8}
                />

                {spicyLabel}
              </span>
            )}

            {product.isVegetarian && (
              <span className={styles.badge}>
                <Leaf
                  size={12}
                  strokeWidth={1.8}
                />

                {veggieLabel}
              </span>
            )}
          </div>

          {product.calories && (
            <span className={styles.calories}>
              {product.calories} {kcalLabel}
            </span>
          )}
        </div>

        {/* =====================================================
            BUTTON
        ===================================================== */}

        <div className={styles.action}>
          <Button3D
            variant="primary"
            size="md"
            className={styles.button}
            onClick={openProduct}
            ariaLabel={`${addToCartLabel}: ${product.name}`}
          >
            <span>{addToCartLabel}</span>
            <span aria-hidden="true">↗</span>
          </Button3D>
        </div>
      </div>
    </article>
  );
}