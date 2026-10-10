import {NextResponse} from 'next/server';
import {siteConfig} from '@/config/site';

export const dynamic = 'force-static';

export function GET() {
  const content = `# ${siteConfig.name}

> ${siteConfig.description}

## Website
- Website: ${siteConfig.domain}
- Menu: ${siteConfig.domain}/menu
- Branches: ${siteConfig.domain}/branches
- Reservations: ${siteConfig.domain}/reserve
- Contact: ${siteConfig.domain}/contact
- Blog: ${siteConfig.domain}/blog

## Contact
- Phone: ${siteConfig.phone}
- Email: ${siteConfig.email}

## Business information
- Cuisine: ${siteConfig.cuisine.join(', ')}
- Price range: ${siteConfig.priceRange}
- Address details and opening hours should be confirmed on the live site; this file does not assert unverified branch counts, order volumes, delivery promises, or discounts.
`;
  return new NextResponse(content, {
    headers: {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600'},
  });
}
