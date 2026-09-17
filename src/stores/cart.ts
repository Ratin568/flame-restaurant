import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export type CartVariant = {id: string; name: string; priceDelta: number};
export type CartModifier = {id: string; name: string; price: number};

export type CartItem = {
  itemId: string;
  productId: string;
  slug: string;
  categorySlug: string;
  name: string;
  variant: CartVariant | null;
  modifiers: CartModifier[];
  unitPrice: number;
  quantity: number;
};

// کلید یکتا: همان محصول با همان سایز و همان افزودنی‌ها = یک ردیف سبد
function buildItemId(productId: string, variant: CartVariant | null, modifiers: CartModifier[]): string {
  const v = variant?.id ?? 'base';
  const m = modifiers.map((x) => x.id).sort().join('.');
  return `${productId}__${v}__${m}`;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'itemId'>) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const itemId = buildItemId(item.productId, item.variant, item.modifiers);
          const existing = state.items.find((i) => i.itemId === itemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.itemId === itemId
                  ? {...i, quantity: Math.min(i.quantity + item.quantity, 99)}
                  : i,
              ),
            };
          }
          return {items: [...state.items, {...item, itemId}]};
        }),
      removeItem: (itemId) =>
        set((state) => ({items: state.items.filter((i) => i.itemId !== itemId)})),
      setQuantity: (itemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.itemId !== itemId)
              : state.items.map((i) =>
                  i.itemId === itemId ? {...i, quantity: Math.min(quantity, 99)} : i,
                ),
        })),
      clear: () => set({items: []}),
    }),
    {name: 'flame-cart'}, // کلید localStorage
  ),
);