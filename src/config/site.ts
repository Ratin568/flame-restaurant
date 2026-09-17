export const siteConfig = {
  name: 'Flame',
  domain: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  description: 'Flame-grilled burgers & artisan pizza. Order online, track live, reserve a table.',
  phone: '+1-555-0100',
  email: 'hello@flame.example',
  address: {
    street: '125 Main Street',
    city: 'Downtown',
  },
  social: {
    instagram: 'https://instagram.com/flame',
    twitter: 'https://twitter.com/flame',
  },
  priceRange: '$$',
  cuisine: ['Burgers', 'Pizza', 'Grill'],
} as const;