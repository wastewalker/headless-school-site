import type { Metadata } from 'next';
import { connection } from 'next/server';
import { EventCard } from '@/components/EventCard';
import { cms } from '@/lib/cms/config';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage() {
  await connection();
  const [upcoming, past] = await Promise.all([
    cms.listEvents('upcoming'),
    cms.listEvents('past', { limit: 10 }),
  ]);
  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>Events</h1>
        <p className="lede">The school calendar. Times are local (UTC−4).</p>
      </header>
      <section aria-labelledby="upcoming-heading" className="stack">
        <h2 id="upcoming-heading">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="event-list">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <p className="muted">Nothing scheduled yet.</p>
        )}
      </section>
      <section aria-labelledby="past-heading" className="stack">
        <h2 id="past-heading">Recently</h2>
        {past.length > 0 ? (
          <div className="event-list event-list-past">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <p className="muted">No past events.</p>
        )}
      </section>
    </div>
  );
}
