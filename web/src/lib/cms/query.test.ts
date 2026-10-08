import {
  activitiesQuery,
  articlesQuery,
  bySlugQuery,
  eventsQuery,
  levelsQuery,
  toQueryString,
} from './query';

const decode = (q: Record<string, unknown>) => decodeURIComponent(toQueryString(q));

describe('Strapi query building', () => {
  it('serialises nested filters in bracket notation', () => {
    expect(decode(articlesQuery({ level: 'primary', limit: 3 }))).toBe(
      '?sort[0]=publishedAt:desc&populate[levels][fields][0]=slug&populate[levels][fields][1]=name&populate[levels][fields][2]=order&pagination[pageSize]=3&filters[levels][slug][$eq]=primary',
    );
  });

  it('omits the level filter when none is given', () => {
    expect(decode(articlesQuery())).not.toContain('filters');
    expect(decode(activitiesQuery())).not.toContain('filters');
    expect(decode(activitiesQuery({ level: 'secondary' }))).toContain(
      'filters[levels][slug][$eq]=secondary',
    );
  });

  it('returns an empty string for an empty query', () => {
    expect(toQueryString({})).toBe('');
  });

  it('looks documents up by slug, one at a time', () => {
    expect(decode(bySlugQuery('open-day'))).toContain('filters[slug][$eq]=open-day');
    expect(decode(bySlugQuery('open-day'))).toContain('pagination[pageSize]=1');
  });

  it('keeps an event that has started but not ended in the upcoming window', () => {
    const now = new Date('2026-10-20T15:00:00.000Z');
    const query = eventsQuery('upcoming', now);
    expect(query.filters.$or[0]).toEqual({ endsAt: { $gte: now.toISOString() } });
    expect(query.sort).toEqual(['startsAt:asc']);
  });

  it('falls back to the start time for events without an end', () => {
    const now = new Date('2026-10-20T15:00:00.000Z');
    expect(eventsQuery('upcoming', now).filters.$or[1]).toEqual({
      endsAt: { $null: true },
      startsAt: { $gte: now.toISOString() },
    });
    expect(eventsQuery('past', now).filters.$or[1]).toEqual({
      endsAt: { $null: true },
      startsAt: { $lt: now.toISOString() },
    });
  });

  it('sorts past events most recent first and honours the limit', () => {
    const query = eventsQuery('past', new Date(), { limit: 5 });
    expect(query.sort).toEqual(['startsAt:desc']);
    expect(query.pagination.pageSize).toBe(5);
  });

  it('orders levels by their position', () => {
    expect(levelsQuery().sort).toEqual(['order:asc']);
  });
});
