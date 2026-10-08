import type { Core } from '@strapi/strapi';

/**
 * Tell the Next.js frontend which content changed, so it can drop exactly the
 * cached pages that depend on it instead of waiting for a timer.
 *
 * Content type UID -> cache tag used by the frontend's fetches.
 */
export const TAG_BY_UID: Readonly<Record<string, string>> = {
  'api::article.article': 'articles',
  'api::event.event': 'events',
  'api::activity.activity': 'activities',
  'api::level.level': 'levels',
  'api::home.home': 'home',
};

const WRITE_ACTIONS = new Set(['create', 'update', 'delete', 'publish', 'unpublish', 'discardDraft']);

export function registerRevalidation(strapi: Core.Strapi): void {
  const url = process.env.FRONTEND_REVALIDATE_URL;
  const secret = process.env.FRONTEND_REVALIDATE_SECRET;
  if (!url || !secret) {
    strapi.log.info('Frontend revalidation disabled (FRONTEND_REVALIDATE_URL/SECRET not set)');
    return;
  }

  strapi.documents.use(async (context, next) => {
    const result = await next();
    const tag = TAG_BY_UID[context.uid];
    if (tag && WRITE_ACTIONS.has(context.action)) {
      // Fire and forget: a frontend that is down must never block an editor's save.
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
        body: JSON.stringify({ tag }),
      }).catch((error: unknown) => {
        strapi.log.warn(`Revalidation for '${tag}' failed: ${String(error)}`);
      });
    }
    return result;
  });
}
