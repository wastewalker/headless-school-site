import { rawActivity, rawArticle, rawEvent, rawHome, rawLevel } from './__fixtures__/raw';
import { CmsError, TAGS, createCmsClient } from './client';

function respond(body: unknown, status = 200) {
  return vi.fn(
    async (
      _url: string,
      _init?: RequestInit & { next?: { tags?: string[]; revalidate?: number | false } },
    ) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
}

const collection = <T>(data: T[]) => ({ data, meta: {} });

describe('createCmsClient', () => {
  it('tags every request and applies the time-based fallback', async () => {
    const fetchMock = respond(collection([rawArticle]));
    const cms = createCmsClient({ baseUrl: 'http://cms.test/', fetch: fetchMock, revalidate: 60 });
    await cms.listArticles({ limit: 2 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url.startsWith('http://cms.test/api/articles?')).toBe(true);
    expect(init?.next).toEqual({ revalidate: 60, tags: [TAGS.articles] });
  });

  it('sends the API token only when one is configured', async () => {
    const withToken = respond(collection([]));
    await createCmsClient({
      baseUrl: 'http://cms.test',
      token: 'secret',
      fetch: withToken,
    }).listActivities();
    expect(new Headers(withToken.mock.calls[0]![1]?.headers).get('Authorization')).toBe(
      'Bearer secret',
    );

    const withoutToken = respond(collection([]));
    await createCmsClient({ baseUrl: 'http://cms.test', fetch: withoutToken }).listActivities();
    expect(new Headers(withoutToken.mock.calls[0]![1]?.headers).has('Authorization')).toBe(false);
  });

  it('maps every collection to domain objects', async () => {
    const make = (body: unknown) =>
      createCmsClient({ baseUrl: 'http://cms.test', fetch: respond(body) });
    expect((await make(collection([rawEvent])).listEvents('upcoming'))[0]?.slug).toBe('open-day');
    expect(
      (await make(collection([rawActivity])).listActivities({ level: 'secondary' }))[0]?.name,
    ).toBe('Robotics');
    expect(
      await make(collection([rawLevel('primary', 2), rawLevel('university')])).listLevels(),
    ).toHaveLength(1);
    expect((await make({ data: rawHome }).getHome()).cta.B).toBe('Come and see a class');
  });

  it('uses the injected clock for the event window', async () => {
    const fetchMock = respond(collection([]));
    const cms = createCmsClient({
      baseUrl: 'http://cms.test',
      fetch: fetchMock,
      now: () => new Date('2026-01-01T00:00:00.000Z'),
    });
    await cms.listEvents('past');
    expect(decodeURIComponent(fetchMock.mock.calls[0]![0])).toContain('2026-01-01T00:00:00.000Z');
  });

  it('returns null for an unknown slug', async () => {
    const cms = createCmsClient({ baseUrl: 'http://cms.test', fetch: respond(collection([])) });
    expect(await cms.getArticle('missing')).toBeNull();
    expect(await cms.getEvent('missing')).toBeNull();
  });

  it('finds documents by slug', async () => {
    const articles = createCmsClient({
      baseUrl: 'http://cms.test',
      fetch: respond(collection([rawArticle])),
    });
    expect((await articles.getArticle('reading-week'))?.title).toBe('Reading week');
    const events = createCmsClient({
      baseUrl: 'http://cms.test',
      fetch: respond(collection([rawEvent])),
    });
    expect((await events.getEvent('open-day'))?.location).toBe('Main campus');
  });

  it('fails clearly when the homepage is unpublished', async () => {
    const cms = createCmsClient({ baseUrl: 'http://cms.test', fetch: respond({ data: null }) });
    await expect(cms.getHome()).rejects.toMatchObject({ status: 404 });
  });

  it('turns HTTP errors and network failures into CmsError', async () => {
    const forbidden = createCmsClient({ baseUrl: 'http://cms.test', fetch: respond({}, 403) });
    await expect(forbidden.listArticles()).rejects.toBeInstanceOf(CmsError);
    await expect(forbidden.listArticles()).rejects.toMatchObject({ status: 403 });

    const down = createCmsClient({
      baseUrl: 'http://cms.test',
      fetch: vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    });
    await expect(down.listArticles()).rejects.toMatchObject({ status: 0 });
  });
});
