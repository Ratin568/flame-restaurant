import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {Clock, Mail, MapPin, Phone} from 'lucide-react';
import {ContactForm} from '@/components/marketing/contact-form';
import {resolveLocaleParams} from '@/i18n/params';
import {buildOgMetadata} from '@/lib/seo/metadata';

type Props = {params: Promise<{locale: string}>};

export const revalidate = 86400;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await resolveLocaleParams(params);
  const t = await getTranslations({locale, namespace: 'contact'});
  return buildOgMetadata(t('title'), t('subtitle'), '/contact');
}

export default async function ContactPage({params}: Props) {
  await resolveLocaleParams(params);
  const t = await getTranslations('contact');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-black sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* فرم واقعی — به دیتابیس ذخیره می‌کند */}
        <ContactForm />

        {/* اطلاعات تماس ثابت */}
        <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-6 text-sm">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">11:00 – 23:00</p>
              <p className="text-xs text-muted-foreground">Every day / weekends until 24:00</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
            <a href="tel:+15550100" dir="ltr" className="transition-colors hover:text-foreground">+1-555-0100</a>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
            <a href="mailto:hello@flame.example" dir="ltr" className="transition-colors hover:text-foreground">hello@flame.example</a>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">125 Main Street, Downtown</p>
          </div>
        </aside>
      </div>
    </main>
  );
}