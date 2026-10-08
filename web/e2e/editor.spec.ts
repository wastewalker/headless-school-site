import { expect, test } from '@playwright/test';

const CMS = 'http://127.0.0.1:1337';
const ARTICLE_UID = 'api::article.article';

/**
 * The editor workflow, end to end: an editor changes a headline in Strapi and
 * publishes it, Strapi's document middleware calls the frontend's revalidation
 * hook, and the site shows the new headline without waiting for the 5-minute
 * cache fallback.
 *
 * A throwaway admin is registered on the test run's fresh database; Strapi only
 * allows this while no admin exists.
 */
test('publishing in Strapi updates the site without a redeploy', async ({ page, request }) => {
  // Warm the cache so the test proves invalidation, not a cold fetch.
  await page.goto('/news');
  await expect(
    page.getByRole('link', { name: 'Reading week fills the primary library' }),
  ).toBeVisible();

  const register = await request.post(`${CMS}/admin/register-admin`, {
    data: {
      email: 'editor@altamira.test',
      password: `E2e-${crypto.randomUUID()}`,
      firstname: 'Test',
      lastname: 'Editor',
    },
  });
  expect(register.ok()).toBe(true);
  const { token } = (await register.json()).data as { token: string };
  const auth = { Authorization: `Bearer ${token}` };

  const list = await request.get(
    `${CMS}/content-manager/collection-types/${ARTICLE_UID}?filters[slug][$eq]=reading-week`,
    { headers: auth },
  );
  expect(list.ok()).toBe(true);
  const [article] = (await list.json()).results as { documentId: string }[];
  expect(article).toBeDefined();

  const headline = `Reading week breaks the library's record (${Date.now()})`;
  const base = `${CMS}/content-manager/collection-types/${ARTICLE_UID}/${article!.documentId}`;
  expect((await request.put(base, { headers: auth, data: { title: headline } })).ok()).toBe(true);
  expect((await request.post(`${base}/actions/publish`, { headers: auth, data: {} })).ok()).toBe(
    true,
  );

  // Stale-while-revalidate: the first request after the hook may still get the
  // cached page while the fresh one renders, so poll briefly.
  await expect(async () => {
    await page.reload();
    await expect(page.getByRole('link', { name: headline })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20_000 });
});
