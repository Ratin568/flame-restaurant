'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ShoppingBag} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {useCartStore} from '@/stores/cart';

export function CartButton() {
  const t = useTranslations('cart');
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative" aria-label={t('title')}>
        <ShoppingBag className="size-5" />
        {mounted && count > 0 && (
          <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Button>
    </Link>
  );
}