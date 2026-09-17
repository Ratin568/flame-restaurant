import type {MetadataRoute} from 'next';
import {siteConfig} from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/account'],
      },
      // 🧠 GEO: خزنده‌های AI صریحاً خوش‌آمدگویی می‌شوند
      // (تا ChatGPT/Perplexity/Gemini بتوانند محتوایت را نقل‌قول کنند)
      {userAgent: 'GPTBot', allow: '/'},
      {userAgent: 'OAI-SearchBot', allow: '/'},
      {userAgent: 'ChatGPT-User', allow: '/'},
      {userAgent: 'PerplexityBot', allow: '/'},
      {userAgent: 'ClaudeBot', allow: '/'},
      {userAgent: 'Google-Extended', allow: '/'},
    ],
    sitemap: `${siteConfig.domain}/sitemap.xml`,
  };
}