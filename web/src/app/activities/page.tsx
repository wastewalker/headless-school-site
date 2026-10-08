import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ActivityCard } from '@/components/ActivityCard';
import { cms } from '@/lib/cms/config';
import { LEVEL_SLUGS } from '@/lib/cms/types';
import { LEVEL_LABEL } from '@/lib/format';
import { readLevel } from '@/lib/personalize';

export const metadata: Metadata = { title: 'Clubs and activities' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ActivitiesPage({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const level = readLevel((await searchParams).level);
  const activities = await cms.listActivities(level ? { level } : {});

  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>Clubs and activities</h1>
        <p className="lede">
          After-school programmes. Some are open to children from other schools.
        </p>
      </header>
      <nav aria-label="Filter by level" className="filters">
        <Link href="/activities" aria-current={level === null ? 'page' : undefined}>
          All levels
        </Link>
        {LEVEL_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/activities?level=${slug}`}
            aria-current={level === slug ? 'page' : undefined}
          >
            {LEVEL_LABEL[slug]}
          </Link>
        ))}
      </nav>
      {activities.length > 0 ? (
        <div className="card-grid">
          {activities.map((activity) => (
            <ActivityCard key={activity.slug} activity={activity} />
          ))}
        </div>
      ) : (
        <p className="muted">No clubs for this level yet.</p>
      )}
    </div>
  );
}
