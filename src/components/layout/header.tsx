import {getTranslations} from 'next-intl/server';
import {Flame} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {ThemeToggle} from './theme-toggle';
import {LocaleSwitcher} from './locale-switcher';
import {MobileNav} from './mobile-nav';
import {CartButton} from './cart-button';   // ← بالای فایل
import {AuthButton} from './auth-button';   // ← بالای فایل

export async function Header() {
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');

  const links = [
    {href: '/', label: t('home')},
    {href: '/menu', label: t('menu')},
    {href: '/branches', label: t('branches')},
    {href: '/reserve', label: t('reserve')},
    {href: '/about', label: t('about')},
    {href: '/contact', label: t('contact')},
    {href: '/blog', label: t('blog')},
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <MobileNav links={links} />

        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="size-5" />
          </span>
          <span className="text-xl font-black tracking-tight">{tc('brand')}</span>
        </Link>

        <nav className="ms-6 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
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