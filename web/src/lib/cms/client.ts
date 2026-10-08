import { toActivity, toArticle, toEvent, toHome, toLevel } from './map';
import {
  activitiesQuery,
  articlesQuery,
  bySlugQuery,
  eventsQuery,
  levelsQuery,
  toQueryString,
} from './query';
import type { EventWindow } from './query';
import type {
  Activity,
  Article,
  Home,
  Level,
  LevelSlug,
  RawActivity,
  RawArticle,
  RawEvent,
  RawHome,
  RawLevel,
  SchoolEvent,
  StrapiCollection,
  StrapiSingle,
} from './types';

/** Cache tags. Strapi's revalidation hook sends the same names (cms/src/revalidate.ts). */
export const TAGS = {
  home: 'home',
  articles: 'articles',
  events: 'events',
  activities: 'activities',
  levels: 'levels',
} as const;

export class CmsError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'CmsError';
    this.status = status;
  }
}

type FetchLike = (
  input: string,
  init?: RequestInit & { next?: NextFetchOptions },
) => Promise<Response>;

interface NextFetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

export interface CmsClient {
  getHome(): Promise<Home>;
  listLevels(): Promise<Level[]>;
  listArticles(options?: { limit?: number; level?: LevelSlug }): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | null>;
  listEvents(window: EventWindow, options?: { limit?: number }): Promise<SchoolEvent[]>;
  getEvent(slug: string): Promise<SchoolEvent | null>;
  listActivities(options?: { level?: LevelSlug }): Promise<Activity[]>;
}

export interface CmsClientOptions {
  baseUrl: string;
  /** Optional read-only API token. Public read works without one. */
  token?: string | undefined;
  /** Seconds before cached CMS data is refreshed even without a webhook. */
  revalidate?: number;
  fetch?: FetchLike;
  now?: () => Date;
}

/**
 * Typed read-only client for the Strapi REST API.
 *
 * Every request carries a cache tag, so Strapi's save hook can invalidate
 * exactly what changed, plus a time-based fallback in case a hook is missed.
 */
export function createCmsClient(options: CmsClientOptions): CmsClient {
  const root = options.baseUrl.replace(/\/+$/, '');
  const fetchImpl: FetchLike = options.fetch ?? (fetch as FetchLike);
  const revalidate = options.revalidate ?? 300;
  const now = options.now ?? (() => new Date());

  async function get<T>(path: string, query: Record<string, unknown>, tag: string): Promise<T> {
    const url = `${root}/api/${path}${toQueryString(query)}`;
    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: {
          Accept: 'application/json',
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
        next: { revalidate, tags: [tag] },
      });
    } catch (cause) {
      throw new CmsError(0, `The CMS at ${root} could not be reached: ${String(cause)}`);
    }
    if (!response.ok) {
      throw new CmsError(response.status, `The CMS answered ${response.status} for /api/${path}`);
    }
    return (await response.json()) as T;
  }

  return {
    async getHome() {
      const body = await get<StrapiSingle<RawHome>>('home', {}, TAGS.home);
      if (!body.data) throw new CmsError(404, 'The homepage has not been published in the CMS');
      return toHome(body.data);
    },
    async listLevels() {
      const body = await get<StrapiCollection<RawLevel>>('levels', levelsQuery(), TAGS.levels);
      return body.data.map(toLevel).filter((level): level is Level => level !== null);
    },
    async listArticles(query = {}) {
      const body = await get<StrapiCollection<RawArticle>>(
        'articles',
        articlesQuery(query),
        TAGS.articles,
      );
      return body.data.map(toArticle);
    },
    async getArticle(slug) {
      const body = await get<StrapiCollection<RawArticle>>(
        'articles',
        bySlugQuery(slug),
        TAGS.articles,
      );
      const first = body.data[0];
      return first ? toArticle(first) : null;
    },
    async listEvents(window, query = {}) {
      const body = await get<StrapiCollection<RawEvent>>(
        'events',
        eventsQuery(window, now(), query),
        TAGS.events,
      );
      return body.data.map(toEvent);
    },
    async getEvent(slug) {
      const body = await get<StrapiCollection<RawEvent>>('events', bySlugQuery(slug), TAGS.events);
      const first = body.data[0];
      return first ? toEvent(first) : null;
    },
    async listActivities(query = {}) {
      const body = await get<StrapiCollection<RawActivity>>(
        'activities',
        activitiesQuery(query),
        TAGS.activities,
      );
      return body.data.map(toActivity);
    },
  };
}
