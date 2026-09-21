import {getTranslations} from 'next-intl/server';
import {Flame} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {NewsletterForm} from './newsletter-form';

export async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');

  return (
    <footer className="flame-footer">
      <div className="flame-footer-inner">
      <div className="flame-footer-grid">
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
          <h3 className="flame-footer-title">{t('quickLinks')}</h3>
          <ul className="mt-3 space-y-2">
            <li><Link href="/menu" className="flame-footer-link">{tn('menu')}</Link></li>
            <li><Link href="/branches" className="flame-footer-link">{tn('branches')}</Link></li>
            <li><Link href="/reserve" className="flame-footer-link">{tn('reserve')}</Link></li>
            <li><Link href="/about" className="flame-footer-link">{tn('about')}</Link></li>
            <li><Link href="/contact" className="flame-footer-link">{tn('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="flame-footer-title">{t('legal')}</h3>
          <ul className="mt-3 space-y-2">
            <li><Link href="/legal/terms" className="flame-footer-link">{t('terms')}</Link></li>
            <li><Link href="/legal/privacy" className="flame-footer-link">{t('privacy')}</Link></li>
            <li><Link href="/legal/refund" className="flame-footer-link">{t('refund')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="flame-footer-title">{t('newsletter')}</h3>
          <div className="mt-3">
            <NewsletterForm />
          </div>
        </div>
      </div>

      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Flame — {t('rights')}
      </div>
    </footer>
  );
}