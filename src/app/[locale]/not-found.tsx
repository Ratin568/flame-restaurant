import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';

export default function NotFoundPage() {
  const t = useTranslations('nav');
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-8xl font-black text-primary">404</h1>
      <Link href="/"><Button>{t('home')}</Button></Link>
    </main>
  );
}