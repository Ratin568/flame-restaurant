import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flame — Flame-Grilled Burgers & Grill',
    short_name: 'Flame',
    description: 'Real fire-grilled flavor. Order online, track live, reserve a table.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#FF5722',
    icons: [
      {
        src: '/branding/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}