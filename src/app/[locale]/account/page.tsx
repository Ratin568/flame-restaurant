import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {LogoutButton} from '@/components/auth/logout-button';
import {getSession} from '@/lib/auth/session';
import {db} from '@/lib/db';
import {resolveLocaleParams} from '@/i18n/params';

export default async function AccountPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await resolveLocaleParams(params);

  const session = await getSession();
  if (!session) notFound(); // لایوت بالا تضمین کرده، این فقط برای TS است

  const user = await db.user.findUnique({
    where: {id: session.userId},
    include: {_count: {select: {orders: true}}},
  });
  if (!user) notFound();

  const t = await getTranslations('auth');
  const memberSince = new Intl.DateTimeFormat(locale, {dateStyle: 'long'}).format(user.createdAt);

  return (
    <main>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">{t('account.title')}</h1>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('account.profile')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('account.memberSince')}: {memberSince}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('account.loyaltyPoints')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-primary">🔥 {user.loyaltyPoints}</p>
            <p className="text-xs text-muted-foreground">{t('account.points')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('account.orders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{user._count.orders}</p>
            {user._count.orders === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">{t('account.ordersEmpty')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}