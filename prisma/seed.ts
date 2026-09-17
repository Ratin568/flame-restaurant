import 'dotenv/config';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/generated/prisma/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

// ─── تایپ‌های کمکی ───
type Translation = {name: string; description: string};
type ProductSeed = {
  slug: string;
  price: number;
  calories?: number;
  prepTime?: number;
  isFeatured?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  en: Translation;
  fa: Translation;
  variants?: {name: string; priceDelta: number; isDefault?: boolean}[];
  modifiers?: {name: string; price: number}[];
  allergens?: string[];
};

async function main() {
  console.log('🔥 Seeding Flame menu...');

  // ─── پاکسازی (برای اجرای تکراری امن است) ───
  await prisma.reservation.deleteMany();   // ← این خط جدید
  await prisma.orderStatusLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productAllergen.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.allergen.deleteMany();
  await prisma.branch.deleteMany();

  // ─── آلرژن‌های استاندارد ───
  const allergenCodes = ['gluten', 'dairy', 'eggs', 'nuts', 'soy', 'fish', 'sesame'];
  const allergens = Object.fromEntries(
    await Promise.all(
      allergenCodes.map(async (code) => [code, await prisma.allergen.create({data: {code}})]),
    ),
  ) as Record<string, {id: string}>;

  // ─── سازنده محصول ───
  async function createProduct(categoryId: string, p: ProductSeed, sort: number) {
    return prisma.product.create({
      data: {
        categoryId,
        slug: p.slug,
        basePrice: p.price,
        calories: p.calories,
        prepTime: p.prepTime ?? 15,
        isFeatured: p.isFeatured ?? false,
        isVegetarian: p.isVegetarian ?? false,
        isSpicy: p.isSpicy ?? false,
        sortOrder: sort,
        translations: {
          create: [
            {locale: 'en', ...p.en},
            {locale: 'fa', ...p.fa},
          ],
        },
        variants: p.variants ? {create: p.variants} : undefined,
        modifiers: p.modifiers ? {create: p.modifiers} : undefined,
        allergens: p.allergens
          ? {create: p.allergens.map((code) => ({allergenId: allergens[code].id}))}
          : undefined,
      },
    });
  }

  // ─── سازنده دسته ───
  async function createCategory(
    slug: string,
    sort: number,
    en: Translation,
    fa: Translation,
    products: ProductSeed[],
  ) {
    const category = await prisma.category.create({
      data: {
        slug,
        sort,
        translations: {
          create: [
            {locale: 'en', ...en},
            {locale: 'fa', ...fa},
          ],
        },
      },
    });
    for (const [i, product] of products.entries()) {
      await createProduct(category.id, product, i);
    }
  }

  // ═══════════ 🍔 BURGERS ═══════════
  await createCategory('burgers', 1, {name: 'Burgers', description: 'Flame-grilled signature burgers'}, {name: 'برگرها', description: 'برگرهای امضای گریل‌شده با آتش'}, [
    {
      slug: 'classic-flame-burger',
      price: 8.99,
      calories: 650,
      prepTime: 12,
      isFeatured: true,
      en: {name: 'Classic Flame Burger', description: 'Our signature flame-grilled beef patty with cheddar, lettuce, tomato and secret Flame sauce.'},
      fa: {name: 'برگر کلاسیک فلییم', description: 'برگر امضای ما با گوشت گریل‌شده با آتش، پنیر چدار، کاهو، گوجه و سس مخفی فلییم.'},
      variants: [
        {name: 'Single', priceDelta: 0, isDefault: true},
        {name: 'Double', priceDelta: 3.5},
      ],
      modifiers: [
        {name: 'Extra Cheese', price: 1.5},
        {name: 'Extra Patty', price: 3},
        {name: 'Jalapeños', price: 0.7},
      ],
      allergens: ['gluten', 'dairy', 'eggs'],
    },
    {
      slug: 'double-trouble-burger',
      price: 12.99,
      calories: 980,
      prepTime: 15,
      isFeatured: true,
      en: {name: 'Double Trouble Burger', description: 'Two flame-grilled patties, double cheddar, crispy bacon and caramelized onions.'},
      fa: {name: 'برگر دابل ترابل', description: 'دو لایه گوشت گریل‌شده، پنیر چدار دوبل، بیکن ترد و پیاز کاراملی.'},
      modifiers: [{name: 'Extra Bacon', price: 2}],
      allergens: ['gluten', 'dairy', 'eggs'],
    },
    {
      slug: 'smoky-bbq-burger',
      price: 11.49,
      calories: 820,
      en: {name: 'Smoky BBQ Burger', description: 'Flame-grilled patty glazed with smoky BBQ sauce, onion rings inside and smoked gouda.'},
      fa: {name: 'برگر بی‌بی‌کی دودی', description: 'برگر گریل‌شده با سس بی‌بی‌کی دودی، حلقه پیاز سوخاری داخل برگر و پنیر گودا دودی.'},
      allergens: ['gluten', 'dairy'],
    },
    {
      slug: 'crispy-chicken-burger',
      price: 9.49,
      calories: 700,
      en: {name: 'Crispy Chicken Burger', description: 'Buttermilk-marinated crispy chicken fillet with ranch and pickles.'},
      fa: {name: 'برگر مرغ کریسپی', description: 'فیله مرغ ترد با دوغ و ادویه، سس رنچ و خیارشور.'},
      allergens: ['gluten', 'eggs'],
    },
    {
      slug: 'garden-veggie-burger',
      price: 8.49,
      calories: 520,
      isVegetarian: true,
      en: {name: 'Garden Veggie Burger', description: 'Plant-based patty with avocado, grilled mushrooms and garlic aioli.'},
      fa: {name: 'برگر گیاهی گاردن', description: 'برگر گیاهی با آووکادو، قارچ گریل و سس سیر مایونز.'},
      allergens: ['gluten'],
    },
  ]);

  // ═══════════ 🍕 PIZZA ═══════════
  await createCategory('pizza', 2, {name: 'Pizza', description: 'Wood-fired artisan pizzas'}, {name: 'پیتزا', description: 'پیتزاهای صنایع دستی با آتش چوب'}, [
    {
      slug: 'margherita',
      price: 10.99,
      calories: 850,
      prepTime: 18,
      isVegetarian: true,
      en: {name: 'Margherita', description: 'Classic tomato sauce, fresh mozzarella and basil on wood-fired crust.'},
      fa: {name: 'مارگاریتا', description: 'سس گوجه کلاسیک، پنیر موزارلای تازه و ریحان روی خمیر پخته‌شده با آتش چوب.'},
      variants: [
        {name: 'Medium 30cm', priceDelta: 0, isDefault: true},
        {name: 'Large 40cm', priceDelta: 4},
      ],
      allergens: ['gluten', 'dairy'],
    },
    {
      slug: 'pepperoni-flame',
      price: 13.99,
      calories: 1100,
      prepTime: 18,
      isFeatured: true,
      en: {name: 'Pepperoni Flame', description: 'Double pepperoni, mozzarella and a hint of chili honey.'},
      fa: {name: 'پپرونی فلییم', description: 'پپرونی دوبل، موزارلا و کمی عسل فلفلی.'},
      variants: [
        {name: 'Medium 30cm', priceDelta: 0, isDefault: true},
        {name: 'Large 40cm', priceDelta: 4},
      ],
      allergens: ['gluten', 'dairy'],
    },
    {
      slug: 'bbq-chicken-pizza',
      price: 14.49,
      calories: 1050,
      en: {name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onions and coriander.'},
      fa: {name: 'پیتزا مرغ بی‌بی‌کی', description: 'سس بی‌بی‌کی دودی، مرغ گریل، پیاز قرمز و گشنیز.'},
      allergens: ['gluten', 'dairy'],
    },
  ]);

  // ═══════════ 🍟 SIDES ═══════════
  await createCategory('sides', 3, {name: 'Sides', description: 'Perfect companions'}, {name: 'ساید‌ها', description: 'همراه‌های بی‌نقص'}, [
    {
      slug: 'crispy-fries',
      price: 3.99,
      calories: 380,
      prepTime: 8,
      isVegetarian: true,
      en: {name: 'Crispy Fries', description: 'Golden, twice-fried, sea salt.'},
      fa: {name: 'سیب‌زمینی کریسپی', description: 'طلایی، دوبار سرخ‌شده، با نمک دریا.'},
      modifiers: [{name: 'Cheese Sauce', price: 1.2}],
    },
    {
      slug: 'loaded-cheese-fries',
      price: 5.49,
      calories: 620,
      isVegetarian: true,
      en: {name: 'Loaded Cheese Fries', description: 'Fries drowned in cheddar sauce with crispy onions.'},
      fa: {name: 'سیب‌زمینی پرپنیر', description: 'سیب‌زمینی غرق در سس چدار با پیاز سوخاری.'},
      allergens: ['dairy', 'gluten'],
    },
    {
      slug: 'onion-rings',
      price: 4.49,
      calories: 410,
      isVegetarian: true,
      en: {name: 'Onion Rings', description: 'Thick-cut, beer-battered, golden fried.'},
      fa: {name: 'حلقه پیاز', description: 'برش‌های ضخیم، با خمیر، سرخ‌شده طلایی.'},
      allergens: ['gluten'],
    },
    {
      slug: 'buffalo-wings',
      price: 7.99,
      calories: 550,
      prepTime: 14,
      isSpicy: true,
      en: {name: 'Buffalo Wings', description: '8 pcs tossed in fiery buffalo sauce with blue cheese dip.'},
      fa: {name: 'بال بوفالو', description: '۸ تکه با سس تند بوفالو و سس پنیر آبی.'},
      allergens: ['dairy'],
    },
  ]);

  // ═══════════ 🍰 DESSERTS ═══════════
  await createCategory('desserts', 4, {name: 'Desserts', description: 'Sweet endings'}, {name: 'دسرها', description: 'پایان‌های شیرین'}, [
    {
      slug: 'chocolate-lava-cake',
      price: 5.99,
      calories: 470,
      prepTime: 10,
      isVegetarian: true,
      en: {name: 'Chocolate Lava Cake', description: 'Warm molten chocolate core with vanilla ice cream.'},
      fa: {name: 'کیک شکلاتی آب‌شده', description: 'قلب شکلات مذاب گرم با بستنی وانیلی.'},
      allergens: ['gluten', 'dairy', 'eggs'],
    },
    {
      slug: 'new-york-cheesecake',
      price: 5.49,
      calories: 430,
      isVegetarian: true,
      en: {name: 'New York Cheesecake', description: 'Dense, creamy, with berry compote.'},
      fa: {name: 'چیزکیک نیویورکی', description: 'متراکم و خامه‌ای با سس توت‌فرنگی.'},
      allergens: ['gluten', 'dairy', 'eggs'],
    },
  ]);

  // ═══════════ 🥤 DRINKS ═══════════
  await createCategory('drinks', 5, {name: 'Drinks', description: 'Stay hydrated'}, {name: 'نوشیدنی‌ها', description: 'تازه و خنک'}, [
    {
      slug: 'soft-drinks',
      price: 2.49,
      prepTime: 2,
      isVegetarian: true,
      en: {name: 'Soft Drinks', description: 'Coke, Sprite, Fanta — ice cold.'},
      fa: {name: 'نوشابه', description: 'کوکاکولا، اسپرایت، فانتا — یخ‌زده.'},
    },
    {
      slug: 'vanilla-milkshake',
      price: 4.99,
      calories: 520,
      isVegetarian: true,
      en: {name: 'Vanilla Milkshake', description: 'Real vanilla bean, hand-spun, whipped cream top.'},
      fa: {name: 'میلک‌شیک وانیلی', description: 'دانه وانیل واقعی، دست‌ساز، با خامه قیفی.'},
      allergens: ['dairy'],
    },
    {
      slug: 'fresh-lemonade',
      price: 3.49,
      calories: 120,
      isVegetarian: true,
      en: {name: 'Fresh Lemonade', description: 'Hand-squeezed lemons, mint, sparkling.'},
      fa: {name: 'لیموناد تازه', description: 'لیموی دست‌آب، نعنا، گازدار.'},
    },
  ]);

  // ═══════════ 🏪 شعبه‌ها ═══════════
  await prisma.branch.createMany({
    data: [
      {slug: 'downtown', phone: '+1-555-0101', address: '125 Main Street, Downtown', lat: 40.758, lng: -73.9855},
      {slug: 'riverside', phone: '+1-555-0102', address: '8 River Road, Riverside', lat: 40.748, lng: -73.9985},
    ],
  });

  // ═══════════ 🎟️ کوپن خوش‌آمدگی ═══════════
  await prisma.coupon.upsert({
    where: {code: 'WELCOME10'},
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10,
      minOrder: 15,
      maxUses: 1000,
    },
  });

  // ─── گزارش نهایی ───
  const [categories, products, translations] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productTranslation.count(),
  ]);
  console.log(`✅ Seed complete!`);
  console.log(`   📂 Categories: ${categories}`);
  console.log(`   🍔 Products: ${products}`);
  console.log(`   🌍 Translations: ${translations} (en + fa)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());