import qs from 'qs';
import type { LevelSlug } from './types';

/**
 * Strapi's REST API takes nested query objects (filters, populate, sort)
 * serialised with bracket notation. Building them with `qs`, as Strapi's docs
 * recommend, keeps each query readable as data and testable as a string.
 */
export function toQueryString(query: Record<string, unknown>): string {
  const encoded = qs.stringify(query, { encodeValuesOnly: true });
  return encoded ? `?${encoded}` : '';
}

const POPULATE_LEVELS = { levels: { fields: ['slug', 'name', 'order'] } };

export function articlesQuery(options: { limit?: number; level?: LevelSlug } = {}) {
  return {
    sort: ['publishedAt:desc'],
    populate: POPULATE_LEVELS,
    pagination: { pageSize: options.limit ?? 20 },
    ...(options.level ? { filters: { levels: { slug: { $eq: options.level } } } } : {}),
  };
}

export function bySlugQuery(slug: string) {
  return {
    filters: { slug: { $eq: slug } },
    populate: POPULATE_LEVELS,
    pagination: { pageSize: 1 },
  };
}

export type EventWindow = 'upcoming' | 'past';

/**
 * Upcoming events sort soonest first; past events sort most recent first. An
 * event that has started but not ended still counts as upcoming, which is why
 * the cut-off is on `endsAt`, with `startsAt` as the fallback when no end is set.
 */
export function eventsQuery(window: EventWindow, now: Date, options: { limit?: number } = {}) {
  const iso = now.toISOString();
  const filters =
    window === 'upcoming'
      ? { $or: [{ endsAt: { $gte: iso } }, { endsAt: { $null: true }, startsAt: { $gte: iso } }] }
      : { $or: [{ endsAt: { $lt: iso } }, { endsAt: { $null: true }, startsAt: { $lt: iso } }] };
  return {
    filters,
    sort: [window === 'upcoming' ? 'startsAt:asc' : 'startsAt:desc'],
    populate: POPULATE_LEVELS,
    pagination: { pageSize: options.limit ?? 50 },
  };
}

export function activitiesQuery(options: { level?: LevelSlug } = {}) {
  return {
    sort: ['name:asc'],
    populate: POPULATE_LEVELS,
    pagination: { pageSize: 100 },
    ...(options.level ? { filters: { levels: { slug: { $eq: options.level } } } } : {}),
  };
}

export function levelsQuery() {
  return { sort: ['order:asc'], fields: ['slug', 'name', 'description', 'order'] };
}
