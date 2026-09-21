import { useTranslations } from 'next-intl';

import { NotFoundGlitch } from '@/components/ui/be-ui-404-not-found';

export default function NotFoundPage() {
  const t = useTranslations('nav');
  const notFound = useTranslations('notFound');

  return (
    <main className="min-h-svh bg-[#090909] text-[#f4f0e8]">
      <NotFoundGlitch
        homeHref="/"
        homeLabel={t('home')}
        browseHref="/menu"
        browseLabel={t('menu')}
        title={notFound('title')}
        description={notFound('description')}
      />
    </main>
  );
}