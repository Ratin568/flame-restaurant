import {redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireAdmin} from '@/lib/auth/admin';
import {TwoFactorSetup} from './two-factor-setup';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin');

  const user = await db.user.findUnique({
    where: {id: admin.userId},
    select: {email: true, twoFactorSecret: true}, // ← email اضافه شد
  });
  if (!user) redirect('/admin');

  return (
    <div>
      <h1 className="text-2xl font-black">Security</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Two-factor authentication for admin access.
      </p>

      <div className="mt-6 max-w-lg">
        <TwoFactorSetup email={user.email} hasSecret={Boolean(user.twoFactorSecret)} />
      </div>
    </div>
  );
}