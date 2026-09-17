import {siteConfig} from '@/config/site';
import type {BranchView} from '@/features/branches/queries';

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
    url: siteConfig.domain,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    servesCuisine: [...siteConfig.cuisine],
    priceRange: siteConfig.priceRange,
    acceptsReservations: 'True',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:00',
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
    ...(branch.lat && branch.lng
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: branch.lat,
            longitude: branch.lng,
          },
        }
      : {}),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:00',
    },
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
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.domain}/menu/${categorySlug}/${product.slug}`,
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
      item: `${siteConfig.domain}${item.url}`,
    })),
  };
}

/** کامپوننت رندر JSON-LD — یکجا برای همه صفحات */
export function JsonLdScript({data}: {data: JsonLd}) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}