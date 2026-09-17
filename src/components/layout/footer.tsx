import {getTranslations} from 'next-intl/server';
import {Flame} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {NewsletterForm} from './newsletter-form';

export async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="size-4" />
            </span>
            <span className="text-lg font-black">{t('tagline').split('.')[0]}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t('tagline')}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">{t('quickLinks')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/menu" className="transition-colors hover:text-foreground">{tn('menu')}</Link></li>
            <li><Link href="/branches" className="transition-colors hover:text-foreground">{tn('branches')}</Link></li>
            <li><Link href="/reserve" className="transition-colors hover:text-foreground">{tn('reserve')}</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-foreground">{tn('about')}</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-foreground">{tn('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">{t('legal')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/legal/terms" className="transition-colors hover:text-foreground">{t('terms')}</Link></li>
            <li><Link href="/legal/privacy" className="transition-colors hover:text-foreground">{t('privacy')}</Link></li>
            <li><Link href="/legal/refund" className="transition-colors hover:text-foreground">{t('refund')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">{t('newsletter')}</h3>
          <div className="mt-3">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Flame — {t('rights')}
      </div>
    </footer>
  );
}