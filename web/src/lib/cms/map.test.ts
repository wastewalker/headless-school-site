import { rawActivity, rawArticle, rawEvent, rawHome, rawLevel } from './__fixtures__/raw';
import { isLevelSlug, toActivity, toArticle, toEvent, toHome, toLevel } from './map';

describe('mapping Strapi responses to domain objects', () => {
  it('keeps the levels the frontend knows and drops the rest', () => {
    expect(toArticle(rawArticle).levels).toEqual(['primary']);
  });

  it('treats a missing relation as no levels', () => {
    const withoutLevels = { ...rawActivity, levels: undefined };
    expect(toActivity(withoutLevels).levels).toEqual([]);
  });

  it('falls back to updatedAt when publishedAt is null', () => {
    expect(toArticle({ ...rawArticle, publishedAt: null }).publishedAt).toBe(rawArticle.updatedAt);
  });

  it('maps events and activities field by field', () => {
    expect(toEvent(rawEvent)).toEqual({
      slug: 'open-day',
      title: 'Open day',
      description: 'Tour the campus.',
      startsAt: '2026-10-20T14:00:00.000Z',
      endsAt: '2026-10-20T18:00:00.000Z',
      location: 'Main campus',
      levels: ['kindergarten', 'primary', 'secondary'],
    });
    expect(toActivity(rawActivity)).toMatchObject({
      slug: 'robotics',
      openToExternal: true,
      levels: ['secondary'],
    });
  });

  it('groups the two CTA variants', () => {
    expect(toHome(rawHome).cta).toEqual({ A: 'Book a visit', B: 'Come and see a class' });
  });

  it('rejects levels it cannot render and defaults descriptions', () => {
    expect(toLevel(rawLevel('university'))).toBeNull();
    expect(toLevel(rawLevel('primary', 2))).toEqual({
      slug: 'primary',
      name: 'Primary',
      description: '',
      order: 2,
    });
  });

  it('recognises level slugs', () => {
    expect(isLevelSlug('secondary')).toBe(true);
    expect(isLevelSlug('Secondary')).toBe(false);
    expect(isLevelSlug(3)).toBe(false);
  });
});
