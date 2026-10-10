import {siteConfig} from '@/config/site';
import type {BranchView} from '@/features/branches/queries';
import {serializeJsonLd} from './url';

export type JsonLd = Record<string, unknown>;

/**
 * تایپ حداقلی برای Schema محصول — فقط فیلدهایی که واقعاً استفاده می‌شوند.
 * هم MenuProduct و هم ProductDetail با این شکل سازگارند (Structural Typing)
 */
type ProductSchemaInput = {
  slug: string;
  name: string;
  description: string;
  price: number;
};

/** صفحه اصلی رستوران — قلب SEO محلی */
export function restaurantSchema(rating?: {value: number; count: number}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    url: siteConfig.domain.replace(/\/$/, ''),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    servesCuisine: [...siteConfig.cuisine],
    priceRange: siteConfig.priceRange,
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
    },
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.value,
            reviewCount: rating.count,
          },
        }
      : {}),
  };
}

/** هر شعبه = LocalBusiness جدا — برای جستجوی «نزدیک من» */
export function localBusinessSchema(branch: BranchView): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${siteConfig.name} ${branch.slug}`,
    telephone: branch.phone ?? siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: branch.address ?? siteConfig.address.street,
      addressLocality: siteConfig.address.city,
    },
    ...(branch.lat != null && branch.lng != null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: branch.lat,
            longitude: branch.lng,
          },
        }
      : {}),
  };
}

/** صفحه محصول — ریچ‌ریزلت با قیمت و موجودی */
export function productSchema(
  product: ProductSchemaInput,
  categorySlug: string,
  rating?: {value: number; count: number},
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: categorySlug,
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: (process.env.FLAME_DEFAULT_CURRENCY || 'EUR').toUpperCase(),
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.domain.replace(/\/$/, '')}/menu/${categorySlug}/${product.slug}`,
    },
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.value,
            reviewCount: rating.count,
          },
        }
      : {}),
  };
}

/** مسیر راهنما (Breadcrumb) — نوار مسیر در نتایج گوگل */
export function breadcrumbSchema(items: {name: string; url: string}[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.domain.replace(/\/$/, '')}${item.url}`,
    })),
  };
}

/** کامپوننت رندر JSON-LD — یکجا برای همه صفحات */
export function JsonLdScript({data}: {data: JsonLd}) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: serializeJsonLd(data)}}
    />
  );
}