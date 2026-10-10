import type {MetadataRoute} from 'next';
import {siteConfig} from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/account']},
      // Explicitly keep private routes disallowed for AI crawlers too.
      ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'].map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/admin', '/api', '/account'],
      })),
    ],
    sitemap: `${siteConfig.domain.replace(/\/$/, '')}/sitemap.xml`,
  };
}
