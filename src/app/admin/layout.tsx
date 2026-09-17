import type {Metadata} from 'next';
import Link from 'next/link';
import {Inter} from 'next/font/google';
import {ShieldAlert} from 'lucide-react';
import {requireAdmin} from '@/lib/auth/admin';
import {getSession} from '@/lib/auth/session';
import {AdminSidebar} from './components/admin-sidebar';
import {TwoFactorChallenge} from './components/two-factor-challenge';
import {Button} from '@/components/ui/button';
import '../globals.css';

const inter = Inter({subsets: ['latin'], variable: '--font-inter'});

export const metadata: Metadata = {
  title: 'Flame Admin',
  robots: {index: false, follow: false}, // 🔒 ادمین هرگز در گوگل ایندکس نمی‌شود
};

export const dynamic = 'force-dynamic';

/**
 * سه حالت رندر:
 * ۱) ادمین با چالش 2FA رد شده        → پوسته کامل + Sidebar + محتوا
 * ۲) ادمینِ لاگین‌شده، 2FA فعال، سشن رد نکرده → چالش کد (به‌جای محتوا — بدون هیچ ریدایرکتی)
 * ۳) مهمان یا نقش غیر ادمین           → Access Denied
 */
export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const session = await getSession();
  const admin = await requireAdmin();

  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="min-h-svh bg-background text-foreground antialiased">
        {admin ? (
          // ─── حالت ۱: دسترسی کامل ───
          <div className="flex min-h-svh">
            <AdminSidebar adminName={admin.name} />
            <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
          </div>
        ) : session?.role === 'ADMIN' ? (
          // ─── حالت ۲: چالش 2FA — children اصلاً رندر نمی‌شود (محتوا نشت نمی‌کند) ───
          <TwoFactorChallenge />
        ) : (
          // ─── حالت ۳: Access Denied ───
          <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
            <ShieldAlert className="size-12 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="max-w-md text-muted-foreground">
              This area is for administrators only. Sign in with an ADMIN account.
            </p>
            <div className="flex gap-3">
              <Link href="/login"><Button>Sign In</Button></Link>
              <Link href="/"><Button variant="outline">Back to Site</Button></Link>
            </div>
          </main>
        )}
      </body>
    </html>
  );
}