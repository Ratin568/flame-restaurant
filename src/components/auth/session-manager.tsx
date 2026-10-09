import {getTranslations} from 'next-intl/server';
import {getSession} from '@/lib/auth/session';
import {revokeDeviceSessionAction, logoutAllDevicesAction} from '@/features/auth/actions';
import {db} from '@/lib/db';
import {routing} from '@/i18n/routing';

export async function SessionManager({locale}:{locale:string}) {
  const current = await getSession();
  if (!current) return null;

  const [history, sessions, t] = await Promise.all([
    db.loginHistory.findMany({where: {userId: current.userId}, orderBy: {createdAt: 'desc'}, take: 10}),
    db.session.findMany({
      where: {userId: current.userId, revokedAt: null, expiresAt: {gt: new Date()}},
      orderBy: {lastUsedAt: 'desc'},
    }),
    getTranslations('auth'),
  ]);

  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-card/50 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{t('account.activeSessions')}</h2>
          <p className="text-xs text-muted-foreground">{t('account.activeSessionsHint')}</p>
        </div>
        <form action={async () => {
          'use server';
          await logoutAllDevicesAction(locale as typeof routing.locales[number]);
        }}>
          <button className="text-xs font-semibold underline">{t('account.logoutAll')}</button>
        </form>
      </div>

      <div className="mt-5 space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="flex flex-col gap-3 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {s.deviceLabel || s.userAgent || t('account.unknownDevice')}
                {s.id === current.sessionId && (
                  <span className="ml-2 text-xs text-emerald-500">{t('account.currentSession')}</span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.ipAddress || t('account.unknownIp')} · {s.lastUsedAt.toLocaleString()}
              </p>
            </div>
            {s.id !== current.sessionId && (
              <form action={revokeDeviceSessionAction.bind(null, s.id)}>
                <button className="text-xs text-destructive underline">{t('account.revoke')}</button>
              </form>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold">{t('account.loginHistory')}</h3>
        <div className="mt-3 space-y-2">
          {history.map(h => (
            <div key={h.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-3 text-xs">
              <span className={h.success ? 'text-emerald-500' : 'text-destructive'}>
                {h.success ? t('account.loginSuccess') : t('account.loginFailed')}
              </span>
              <span className="text-muted-foreground">
                {h.ipAddress || t('account.unknownIp')} · {h.createdAt.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
