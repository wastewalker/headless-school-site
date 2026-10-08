import type { Core } from '@strapi/strapi';
import { activities, articles, events, home, levels } from './data';

const PUBLIC_READ = [
  'api::level.level',
  'api::article.article',
  'api::event.event',
  'api::activity.activity',
  'api::home.home',
] as const;

/**
 * Let anonymous visitors read published content, and nothing else.
 *
 * The frontend reads Strapi's REST API without a token, so the public role
 * needs `find`/`findOne` on each content type. Doing it in code instead of the
 * admin panel means a fresh clone is usable without clicking through settings.
 */
export async function grantPublicRead(strapi: Core.Strapi): Promise<void> {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!role) return;

  for (const uid of PUBLIC_READ) {
    for (const action of ['find', 'findOne']) {
      const name = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: name, role: role.id } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action: name, role: role.id } });
      }
    }
  }
}

/** Seed the fictional school once. Skipped when any level already exists. */
export async function seed(strapi: Core.Strapi): Promise<boolean> {
  const existing = await strapi.documents('api::level.level').count({});
  if (existing > 0) return false;

  const levelIds = new Map<string, string>();
  for (const level of levels) {
    const created = await strapi.documents('api::level.level').create({
      data: { ...level },
      status: 'published',
    });
    levelIds.set(level.slug, created.documentId);
  }
  const connect = (slugs: readonly string[]) => slugs.map((slug) => levelIds.get(slug)!);

  await strapi.documents('api::home.home').create({ data: home, status: 'published' });

  for (const { levels: tagged, ...article } of articles) {
    await strapi.documents('api::article.article').create({
      data: { ...article, levels: connect(tagged) } as never,
      status: 'published',
    });
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  for (const { levels: tagged, startsInDays, durationHours, ...event } of events) {
    // Start every event at 14:00 UTC (10:00 in UTC-4) so times read sensibly.
    const start = new Date(now + startsInDays * day);
    start.setUTCHours(14, 0, 0, 0);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    await strapi.documents('api::event.event').create({
      data: { ...event, startsAt: start.toISOString(), endsAt: end.toISOString(), levels: connect(tagged) } as never,
      status: 'published',
    });
  }

  for (const { levels: tagged, ...activity } of activities) {
    await strapi.documents('api::activity.activity').create({
      data: { ...activity, levels: connect(tagged) } as never,
      status: 'published',
    });
  }
  return true;
}
