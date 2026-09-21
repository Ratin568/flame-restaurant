import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getMenu } from '@/features/menu/queries';
import { ProductCard } from '@/components/menu/product-card';
import { resolveLocaleParams } from '@/i18n/params';
import { buildOgMetadata } from '@/lib/seo/metadata';

import styles from './menu.module.css';

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({
    locale,
    namespace: 'menu',
  });

  return buildOgMetadata(
    t('title'),
    t('subtitle'),
    '/menu',
  );
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await resolveLocaleParams(params);

  const t = await getTranslations({
    locale,
    namespace: 'menu',
  });

  const categories = await getMenu(locale);

  const totalProducts = categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <main className={styles.page}>
      {/* =========================================================
          CINEMATIC INTRO
      ========================================================= */}

      <section className={styles.intro}>
        <div className={styles.introGlow} />

        <div className={styles.grid} aria-hidden="true" />

        <div className={styles.introTop}>
          <span className={styles.kicker}>
            FLAME / MENU
          </span>

          <span className={styles.meta}>
            {String(categories.length).padStart(2, '0')} CATEGORIES
            <span className={styles.metaDot}>•</span>
            {String(totalProducts).padStart(2, '0')} ITEMS
          </span>
        </div>

        <div className={styles.introMain}>
          <div className={styles.chapter}>
            <span>01</span>
            <span>THE MENU</span>
          </div>

          <h1 className={styles.title}>
            <span>BUILT</span>
            <span>
              FOR <em>FIRE.</em>
            </span>
          </h1>

          <p className={styles.subtitle}>
            {t('subtitle')}
          </p>
        </div>

        <div className={styles.introBottom}>
          <span className={styles.bottomLine} />

          <span className={styles.scrollText}>
            SCROLL TO EXPLORE
          </span>

          <span className={styles.bottomLine} />
        </div>
      </section>

      {/* =========================================================
          CATEGORY NAVIGATION
      ========================================================= */}

      <nav
        className={styles.categoryRail}
        aria-label="Menu categories"
      >
        <div className={styles.categoryRailInner}>
          <a
            href="#menu-start"
            className={styles.categoryAll}
          >
            <span>00</span>
            <strong>ALL</strong>
          </a>

          {categories.map((category, index) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className={styles.categoryLink}
            >
              <span>
                {String(index + 1).padStart(2, '0')}
              </span>

              <strong>{category.name}</strong>
            </a>
          ))}
        </div>
      </nav>

      {/* =========================================================
          MENU CONTENT
      ========================================================= */}

      <div
        id="menu-start"
        className={styles.menuContent}
      >
        {categories.map((category, categoryIndex) => (
          <section
            key={category.id}
            id={category.slug}
            className={styles.categorySection}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIdentity}>
                <span className={styles.sectionNumber}>
                  {String(categoryIndex + 1).padStart(2, '0')}
                </span>

                <div>
                  <span className={styles.sectionEyebrow}>
                    FLAME / {String(categoryIndex + 1).padStart(2, '0')}
                  </span>

                  <h2>{category.name}</h2>
                </div>
              </div>

              <div className={styles.sectionDescription}>
                {category.description && (
                  <p>{category.description}</p>
                )}

                <span>
                  {String(category.products.length).padStart(2, '0')} ITEMS
                </span>
              </div>
            </div>

            <div className={styles.sectionRule}>
              <span />
              <span />
            </div>

            <div className={styles.productGrid}>
              {category.products.map((product, productIndex) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categorySlug={category.slug}
                  locale={locale}
                  index={productIndex}
                  addToCartLabel={t('addToCart')}
                  spicyLabel={t('spicy')}
                  veggieLabel={t('veggie')}
                  kcalLabel={t('kcal')}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* =========================================================
          END MARK
      ========================================================= */}

      <footer className={styles.endMark}>
        <div className={styles.endOrb}>
          <span />
          <span />
          <span />
        </div>

        <span className={styles.endLabel}>
          FLAME / 2026
        </span>

        <strong>
          COME HUNGRY.
          <br />
          LEAVE HAPPY.
        </strong>
      </footer>
    </main>
  );
}