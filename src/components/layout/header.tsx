import {getTranslations} from 'next-intl/server';
import {Flame} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {ThemeToggle} from './theme-toggle';
import {LocaleSwitcher} from './locale-switcher';
import {MobileNav} from './mobile-nav';
import {CartButton} from './cart-button';
import {AuthButton} from './auth-button';

export async function Header() {
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');

  const links = [
    {href: '/', label: t('home')},
    {href: '/menu', label: t('menu')},
    {href: '/branches', label: t('branches')},
    {href: '/reserve', label: t('reserve')},
    {href: '/blog', label: t('blog')},
    {href: '/about', label: t('about')},
    {href: '/contact', label: t('contact')},
  ];

  return (
    <header className="flame-header">
      <div className="flame-header-inner">
        <MobileNav links={links} />

        <Link href="/" className="flame-brand">
          <span className="flame-brand-mark">
            <Flame className="size-5" />
          </span>
          <span>{tc('brand')}</span>
        </Link>

        <nav className="flame-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className=""
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flame-header-actions">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <AuthButton />
          <CartButton />
          <ThemeToggle />
          <Link href="/menu">
            <Button size="sm">🔥 {tc('orderNow')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}