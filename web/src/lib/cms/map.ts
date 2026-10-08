import { LEVEL_SLUGS } from './types';
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
} from './types';

export function isLevelSlug(value: unknown): value is LevelSlug {
  return typeof value === 'string' && (LEVEL_SLUGS as readonly string[]).includes(value);
}

/**
 * Editors can create levels the frontend does not know about. Those are dropped
 * rather than crashing a page, because a new level is a product decision that
 * needs design work (labels, colours, a filter option) before it can render.
 */
function levelSlugs(levels: RawLevel[] | undefined): LevelSlug[] {
  return (levels ?? []).map((level) => level.slug).filter(isLevelSlug);
}

export function toLevel(raw: RawLevel): Level | null {
  if (!isLevelSlug(raw.slug)) return null;
  return { slug: raw.slug, name: raw.name, description: raw.description ?? '', order: raw.order };
}

export function toArticle(raw: RawArticle): Article {
  return {
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    body: raw.body,
    category: raw.category,
    levels: levelSlugs(raw.levels),
    // Only published documents reach the public API, but the field is
    // nullable in Strapi's types; fall back to the last update.
    publishedAt: raw.publishedAt ?? raw.updatedAt,
  };
}

export function toEvent(raw: RawEvent): SchoolEvent {
  return {
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
    location: raw.location,
    levels: levelSlugs(raw.levels),
  };
}

export function toActivity(raw: RawActivity): Activity {
  return {
    slug: raw.slug,
    name: raw.name,
    summary: raw.summary,
    category: raw.category,
    schedule: raw.schedule,
    openToExternal: raw.openToExternal,
    levels: levelSlugs(raw.levels),
  };
}

export function toHome(raw: RawHome): Home {
  return {
    heroTitle: raw.heroTitle,
    heroSubtitle: raw.heroSubtitle,
    cta: { A: raw.ctaVariantA, B: raw.ctaVariantB },
    ctaUrl: raw.ctaUrl,
  };
}
