'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Check, Minus, Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {formatPrice} from '@/lib/money';
import {useCartStore} from '@/stores/cart';
import type {ProductDetail} from '@/features/menu/queries';

export function AddToCartForm({product, locale}: {product: ProductDetail; locale: string}) {
  const t = useTranslations('product');
  const addItem = useCartStore((s) => s.addItem);

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(defaultVariant?.id ?? null);
  const [modifierIds, setModifierIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const chosenModifiers = product.modifiers.filter((m) => modifierIds.has(m.id));
  const unitPrice =
    product.price + (variant?.priceDelta ?? 0) + chosenModifiers.reduce((sum, m) => sum + m.price, 0);

  function toggleModifier(id: string) {
    setModifierIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      categorySlug: product.categorySlug,
      name: product.name,
      variant: variant ? {id: variant.id, name: variant.name, priceDelta: variant.priceDelta} : null,
      modifiers: chosenModifiers.map((m) => ({id: m.id, name: m.name, price: m.price})),
      unitPrice,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-6">
      {product.variants.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">{t('variant')}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  variantId === v.id
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {v.name}
                {v.priceDelta > 0 && (
                  <span className="ms-1 text-xs">+{formatPrice(v.priceDelta, locale)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.modifiers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">{t('modifiers')}</h3>
          <div className="mt-2 space-y-2">
            {product.modifiers.map((m) => {
              const selected = modifierIds.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleModifier(m.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`grid size-5 place-items-center rounded-md border ${
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      }`}
                    >
                      {selected && <Check className="size-3.5" />}
                    </span>
                    {m.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    +{formatPrice(m.price, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="-"
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            aria-label="+"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <Button className="flex-1" size="lg" onClick={handleAdd} disabled={added}>
          {added ? t('added') : `${t('add')} — ${formatPrice(unitPrice * quantity, locale)}`}
        </Button>
      </div>
    </div>
  );
}