import Link from 'next/link';
import type { LevelSlug, SchoolEvent } from '@/lib/cms/types';
import { dateBadge, formatEventWhen } from '@/lib/format';
import { LevelTags } from './LevelTags';

export function EventCard({
  event,
  highlight,
}: {
  event: SchoolEvent;
  highlight?: LevelSlug | null;
}) {
  const badge = dateBadge(event.startsAt);
  return (
    <article className="event-card">
      <div className="date-badge" aria-hidden="true">
        <span className="date-day">{badge.day}</span>
        <span className="date-month">{badge.month}</span>
      </div>
      <div className="event-body">
        <h3>
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        <p className="meta">
          <time dateTime={event.startsAt}>{formatEventWhen(event.startsAt, event.endsAt)}</time>
          <span aria-hidden="true"> · </span>
          {event.location}
        </p>
        <LevelTags levels={event.levels} highlight={highlight ?? null} />
      </div>
    </article>
  );
}
