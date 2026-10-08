import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LevelTags } from '@/components/LevelTags';
import { cms } from '@/lib/cms/config';
import { formatEventWhen } from '@/lib/format';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const event = await cms.getEvent((await params).slug);
  return event ? { title: event.title, description: event.description } : { title: 'Events' };
}

export default async function EventPage({ params }: { params: Params }) {
  const event = await cms.getEvent((await params).slug);
  if (!event) notFound();
  return (
    <article className="reading">
      <Link href="/events" className="back">
        ← All events
      </Link>
      <h1>{event.title}</h1>
      <dl className="facts">
        <div>
          <dt>When</dt>
          <dd>
            <time dateTime={event.startsAt}>{formatEventWhen(event.startsAt, event.endsAt)}</time>
          </dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{event.location}</dd>
        </div>
      </dl>
      <LevelTags levels={event.levels} />
      <p className="lede">{event.description}</p>
    </article>
  );
}
