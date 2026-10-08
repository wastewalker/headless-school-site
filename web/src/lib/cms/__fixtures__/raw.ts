import type { RawActivity, RawArticle, RawEvent, RawHome, RawLevel } from '../types';

const base = {
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  publishedAt: '2026-10-03T12:00:00.000Z',
};

export const rawLevel = (slug: string, order = 1): RawLevel => ({
  ...base,
  id: order,
  documentId: `lvl-${slug}`,
  name: slug[0]!.toUpperCase() + slug.slice(1),
  slug,
  description: null,
  order,
});

export const rawArticle: RawArticle = {
  ...base,
  id: 1,
  documentId: 'art-1',
  title: 'Reading week',
  slug: 'reading-week',
  excerpt: 'Every class read aloud.',
  body: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hello' }] }],
  category: 'school-life',
  levels: [rawLevel('primary', 2), rawLevel('university', 9)],
};

export const rawEvent: RawEvent = {
  ...base,
  id: 2,
  documentId: 'evt-1',
  title: 'Open day',
  slug: 'open-day',
  description: 'Tour the campus.',
  startsAt: '2026-10-20T14:00:00.000Z',
  endsAt: '2026-10-20T18:00:00.000Z',
  location: 'Main campus',
  levels: [rawLevel('kindergarten'), rawLevel('primary', 2), rawLevel('secondary', 3)],
};

export const rawActivity: RawActivity = {
  ...base,
  id: 3,
  documentId: 'act-1',
  name: 'Robotics',
  slug: 'robotics',
  summary: 'Build robots.',
  category: 'science',
  schedule: 'Wed 15:30',
  openToExternal: true,
  levels: [rawLevel('secondary', 3)],
};

export const rawHome: RawHome = {
  ...base,
  id: 4,
  documentId: 'home',
  heroTitle: 'Welcome',
  heroSubtitle: 'A school.',
  ctaVariantA: 'Book a visit',
  ctaVariantB: 'Come and see a class',
  ctaUrl: '/visit',
};
