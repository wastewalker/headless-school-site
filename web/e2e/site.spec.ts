import { expect, test } from '@playwright/test';

test('the homepage renders CMS copy and both CTA variants', async ({ page }) => {
  await page.goto('/?variant=A');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Learning in three languages, from the first day',
  );
  const cta = page.locator('[data-experiment="home-cta-2026-10"]');
  await expect(cta).toHaveText('Book a visit');
  await expect(cta).toHaveAttribute('data-variant', 'A');

  await page.goto('/?variant=B');
  await expect(cta).toHaveText('Come and see a class');
  await expect(cta).toHaveAttribute('data-variant', 'B');
});

test('a visitor keeps the same variant across visits', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('[data-experiment="home-cta-2026-10"]');
  const first = await cta.getAttribute('data-variant');
  expect(first === 'A' || first === 'B').toBe(true);
  for (let i = 0; i < 3; i++) {
    await page.reload();
    await expect(cta).toHaveAttribute('data-variant', first!);
  }
});

test('choosing a level personalises the homepage and is remembered', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Coming up', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Kindergarten' }).click();
  await expect(
    page.getByRole('heading', { name: 'Coming up for Kindergarten families' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kindergarten' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // The first upcoming event is the one tagged for kindergarten families.
  const firstEvent = page.locator('.event-card').first();
  await expect(firstEvent).toContainText('For your family');

  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Coming up for Kindergarten families' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Everything' }).click();
  await expect(page.getByRole('heading', { name: 'Coming up', exact: true })).toBeVisible();
});

test('news articles render Strapi rich text', async ({ page }) => {
  await page.goto('/news');
  await page
    .getByRole('link', { name: 'Secondary students take the science fair to the town square' })
    .click();
  await expect(page).toHaveURL(/\/news\/science-fair-2026$/);
  await expect(page.getByRole('heading', { name: 'What the students built' })).toBeVisible();
  await expect(page.locator('.prose').getByRole('listitem')).toHaveCount(3);
});

test('the calendar splits upcoming and past events', async ({ page }) => {
  await page.goto('/events');
  const upcoming = page.getByRole('region', { name: 'Upcoming' });
  const past = page.getByRole('region', { name: 'Recently' });
  await expect(upcoming.getByRole('link', { name: 'Open day for new families' })).toBeVisible();
  await expect(past.getByRole('link', { name: 'Science fair' })).toBeVisible();
  await expect(upcoming.getByRole('link', { name: 'Science fair' })).toHaveCount(0);

  await upcoming.getByRole('link', { name: 'Open day for new families' }).click();
  await expect(page.getByText('Main campus')).toBeVisible();
});

test('clubs filter by level through the URL', async ({ page }) => {
  await page.goto('/activities');
  await page.getByRole('link', { name: 'Kindergarten' }).click();
  await expect(page).toHaveURL(/level=kindergarten/);
  await expect(page.getByRole('heading', { name: 'Little explorers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Debate society' })).toHaveCount(0);
});

test('unknown content returns a 404 page', async ({ page }) => {
  const response = await page.goto('/news/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('the revalidation hook refuses a wrong secret', async ({ request }) => {
  const response = await request.post('/api/revalidate', {
    headers: { 'x-revalidate-secret': 'wrong' },
    data: { tag: 'articles' },
  });
  expect(response.status()).toBe(401);
});
