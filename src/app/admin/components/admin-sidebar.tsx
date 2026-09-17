'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {CalendarClock, ExternalLink, FileText, Flame, LayoutDashboard, Mail, Package, ShieldCheck, ShoppingCart, Star, Tag, Ticket} from 'lucide-react';

const links = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/orders', label: 'Orders', icon: ShoppingCart},
  {href: '/admin/reservations', label: 'Reservations', icon: CalendarClock},
  {href: '/admin/messages', label: 'Messages', icon: Mail},
  {href: '/admin/products', label: 'Products', icon: Package},
  {href: '/admin/categories', label: 'Categories', icon: Tag},
  {href: '/admin/coupons', label: 'Coupons', icon: Ticket},
  {href: '/admin/reviews', label: 'Reviews', icon: Star},
  {href: '/admin/blog', label: 'Blog', icon: FileText},
  {href: '/admin/security', label: 'Security', icon: ShieldCheck},
];
export function AdminSidebar({adminName}: {adminName: string}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-e border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="size-4" />
        </span>
        <span className="font-black">Flame Admin</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({href, label, icon: Icon}) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <p className="px-3 pb-2 text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{adminName}</span>
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View Site
        </Link>
      </div>
    </aside>
  );
}