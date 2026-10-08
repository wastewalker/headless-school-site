import type { ActivityCategory, ArticleCategory, LevelSlug } from './cms/types';

/** The fictional school is in UTC-4; render every time there, on server and client alike. */
export const SCHOOL_TIME_ZONE = 'America/La_Paz';

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: SCHOOL_TIME_ZONE,
});
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SCHOOL_TIME_ZONE,
});
const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: SCHOOL_TIME_ZONE,
});

function sameDay(a: Date, b: Date): boolean {
  return dayFormat.format(a) === dayFormat.format(b);
}

/** "Sat 17 Oct 2026, 10:00–14:00", or both dates when an event spans days. */
export function formatEventWhen(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt);
  if (!endsAt) return `${dayFormat.format(start)}, ${timeFormat.format(start)}`;
  const end = new Date(endsAt);
  if (sameDay(start, end)) {
    return `${dayFormat.format(start)}, ${timeFormat.format(start)}–${timeFormat.format(end)}`;
  }
  return `${dayFormat.format(start)} – ${dayFormat.format(end)}`;
}

export function formatDate(iso: string): string {
  return shortDate.format(new Date(iso));
}

/** Parts for a calendar-style date badge. */
export function dateBadge(iso: string): { day: string; month: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: SCHOOL_TIME_ZONE,
  }).formatToParts(new Date(iso));
  return {
    day: parts.find((p) => p.type === 'day')?.value ?? '',
    month: parts.find((p) => p.type === 'month')?.value ?? '',
  };
}

export const LEVEL_LABEL: Readonly<Record<LevelSlug, string>> = {
  kindergarten: 'Kindergarten',
  primary: 'Primary',
  secondary: 'Secondary',
};

export const ARTICLE_CATEGORY_LABEL: Readonly<Record<ArticleCategory, string>> = {
  'school-life': 'School life',
  academics: 'Academics',
  sports: 'Sports',
  community: 'Community',
};

export const ACTIVITY_CATEGORY_LABEL: Readonly<Record<ActivityCategory, string>> = {
  sports: 'Sports',
  arts: 'Arts',
  science: 'Science',
  languages: 'Languages',
  leadership: 'Leadership',
};

/** "Whole school" reads better than listing all three levels. */
export function describeLevels(levels: readonly LevelSlug[]): string {
  if (levels.length === 0) return 'Whole school';
  if (levels.length === 3) return 'Whole school';
  return levels.map((level) => LEVEL_LABEL[level]).join(' · ');
}
