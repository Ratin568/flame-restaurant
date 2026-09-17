import type {Metadata, Viewport} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {Inter, Vazirmatn} from 'next/font/google';
import {routing, rtlLocales} from '@/i18n/routing';
import {resolveLocaleParams} from '@/i18n/params';
import {siteConfig} from '@/config/site';
import {buildOgMetadata} from '@/lib/seo/metadata';
import {ThemeProvider} from '@/components/layout/theme-provider';
import {Header} from '@/components/layout/header';
import {Footer} from '@/components/layout/footer';
import {Analytics} from '@/components/layout/analytics';
import '../globals.css';

const inter = Inter({subsets: ['latin'], variable: '--font-inter'});
const vazirmatn = Vazirmatn({subsets: ['arabic'], variable: '--font-vazirmatn'});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

// ─── نوار مرورگر موبایل: نارنجی Flame 🔥 (Viewport جدا از Metadata است در Next 15+) ───
export const viewport: Viewport = {
  themeColor: '#FF5722',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'Metadata'});

  return {
    metadataBase: new URL(siteConfig.domain),
    ...buildOgMetadata(t('title'), t('description'), '/'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await resolveLocaleParams(params);
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-svh flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}