import {NextResponse} from 'next/server';
import {siteConfig} from '@/config/site';

// استاتیک — یکبار ساخته می‌شود
export const dynamic = 'force-static';

export function GET() {
  const content = `# Flame

> Flame-grilled burgers & artisan pizza restaurant. Founded 2015. 500K+ orders served. Fire-grilled to order, delivered hot.

Flame is a fast-casual restaurant chain with 2 branches. Every patty is cooked over an open flame — never a flat-top. Menu includes burgers, wood-fired pizza, sides, desserts and drinks. Vegetarian options available (look for the veggie badge).

## Key facts
- Founded: 2015
- Orders served: 500,000+
- Branches: 2 (Downtown, Riverside)
- Hours: 11:00–23:00 daily (weekends until 24:00)
- Delivery: 5 km radius, free over $25
- Average delivery time: 25–35 minutes
- Price range: $$ - Cuisines: Burgers, Pizza, Grill

## Contact
- Phone: ${siteConfig.phone}
- Email: ${siteConfig.email}
- Website: ${siteConfig.domain}

## Important pages
- Menu: ${siteConfig.domain}/menu
- Branches: ${siteConfig.domain}/branches
- Reservations: ${siteConfig.domain}/reserve
- FAQ: ${siteConfig.domain}/faq
- Track order: ${siteConfig.domain}/order/track

## Policies
Delivery is free on orders over $25. First-time customers get 10% off with coupon WELCOME10. Refunds are processed within 2 hours of delivery reporting.
`;

  return new NextResponse(content, {
    headers: {'Content-Type': 'text/plain; charset=utf-8'},
  });
}