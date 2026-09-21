import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {resolveLocaleParams} from '@/i18n/params';
import {restaurantSchema, JsonLdScript} from '@/lib/seo/schema';
import {db} from '@/lib/db';
import FlameHero from '@/components/FlameHero/FlameHero';
import StoryExperience from '@/components/StoryExperience/StoryExperience';

export const revalidate = 3600;

export default async function HomePage({params}:{params:Promise<{locale:string}>}) {
  await resolveLocaleParams(params);
  const t = await getTranslations('home');
  const agg = await db.review.aggregate({_avg:{rating:true},_count:{_all:true},where:{isApproved:true}});

  const scenes = [
    {id:'burger',chapter:t('story.scene1.chapter'),title:t('story.scene1.title'),description:t('story.scene1.description'),start:0,end:.41,visual:'burger' as const},
    {id:'heat',chapter:t('story.scene2.chapter'),title:t('story.scene2.title'),description:t('story.scene2.description'),start:.47,end:.65,visual:'heat' as const},
    {id:'menu',chapter:t('story.scene3.chapter'),title:t('story.scene3.title'),description:t('story.scene3.description'),start:.78,end:.85,visual:'menu' as const},
    {id:'cta',chapter:t('story.scene4.chapter'),title:t('story.scene4.title'),description:t('story.scene4.description'),start:.86,end:1,visual:'cta' as const},
  ];

  return <main>
    <JsonLdScript data={restaurantSchema(agg._count._all>0&&agg._avg.rating!=null?{value:Math.round(agg._avg.rating*10)/10,count:agg._count._all}:undefined)} />
    <FlameHero
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
      primary={t('hero.ctaPrimary')}
      secondary={t('hero.ctaSecondary')}
    />
    <StoryExperience scenes={scenes} />
    <section className="flame-page" style={{paddingTop:'110px',paddingBottom:'110px'}}>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div><span className="flame-kicker">{t('hero.badge')}</span><h2 className="flame-heading">{t('story.scene4.title')}</h2></div>
        <div><p className="flame-lead">{t('hero.subtitle')}</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/menu"><Button size="lg">🔥 {t('hero.ctaPrimary')}</Button></Link><Link href="/reserve"><Button size="lg" variant="outline">{t('hero.ctaSecondary')}</Button></Link></div></div>
      </div>
    </section>
  </main>;
}
