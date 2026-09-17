import {redirect} from '@/i18n/navigation';
import {getSession} from '@/lib/auth/session';
import {resolveLocaleParams} from '@/i18n/params';

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await resolveLocaleParams(params);
  const session = await getSession();

  if (!session) redirect({href: '/login', locale});

  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}