import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArticleCard } from '@/components/ArticleCard';
import { CtaButton } from '@/components/CtaButton';
import { EventCard } from '@/components/EventCard';
import { LevelPicker } from '@/components/LevelPicker';
import { cms } from '@/lib/cms/config';
import {
  HOME_CTA_EXPERIMENT,
  VISITOR_COOKIE,
  assignVariant,
  forcedVariant,
} from '@/lib/experiment';
import { LEVEL_LABEL } from '@/lib/format';
import { LEVEL_COOKIE, prioritiseByLevel, readLevel } from '@/lib/personalize';
import { setLevelAction } from './actions';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const [jar, params] = await Promise.all([cookies(), searchParams]);
  const level = readLevel(jar.get(LEVEL_COOKIE)?.value);
  const visitorId = jar.get(VISITOR_COOKIE)?.value ?? 'anonymous';
  const variant = forcedVariant(params.variant) ?? assignVariant(visitorId, HOME_CTA_EXPERIMENT);

  const [home, events, articles] = await Promise.all([
    cms.getHome(),
    cms.listEvents('upcoming', { limit: 12 }),
    cms.listArticles({ limit: 12 }),
  ]);
  const nextEvents = prioritiseByLevel(events, level).slice(0, 3);
  const latest = prioritiseByLevel(articles, level).slice(0, 3);

  return (
    <div className="stack-xl">
      <section className="hero">
        <p className="eyebrow">Kindergarten to Secondary · Spanish, English, German</p>
        <h1>{home.heroTitle}</h1>
        <p className="lede">{home.heroSubtitle}</p>
        <div className="hero-actions">
          <CtaButton
            href={home.ctaUrl}
            label={home.cta[variant]}
            experiment={HOME_CTA_EXPERIMENT}
            variant={variant}
          />
          <Link href="/events" className="button button-ghost button-lg">
            See the calendar
          </Link>
        </div>
      </section>

      <LevelPicker current={level} action={setLevelAction} />

      <section aria-labelledby="events-heading" className="stack">
        <div className="section-head">
          <h2 id="events-heading">
            {level ? `Coming up for ${LEVEL_LABEL[level]} families` : 'Coming up'}
          </h2>
          <Link href="/events" className="more">
            All events →
          </Link>
        </div>
        {nextEvents.length > 0 ? (
          <div className="event-list">
            {nextEvents.map((event) => (
              <EventCard key={event.slug} event={event} highlight={level} />
            ))}
          </div>
        ) : (
          <p className="muted">No upcoming events right now.</p>
        )}
      </section>

      <section aria-labelledby="news-heading" className="stack">
        <div className="section-head">
          <h2 id="news-heading">Latest news</h2>
          <Link href="/news" className="more">
            All news →
          </Link>
        </div>
        <div className="card-grid">
          {latest.map((article) => (
            <ArticleCard key={article.slug} article={article} highlight={level} />
          ))}
        </div>
      </section>
    </div>
  );
}
