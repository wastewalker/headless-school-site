import { handleRevalidate } from './revalidate';

function request(body: unknown, secret?: string) {
  return new Request('http://web.test/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'x-revalidate-secret': secret } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('handleRevalidate', () => {
  it('revalidates a known tag with the right secret', async () => {
    const revalidate = vi.fn();
    const result = await handleRevalidate(
      request({ tag: 'events' }, 's3cret'),
      's3cret',
      revalidate,
    );
    expect(result).toEqual({ status: 200, body: { revalidated: 'events' } });
    expect(revalidate).toHaveBeenCalledWith('events');
  });

  it('refuses a wrong or missing secret', async () => {
    const revalidate = vi.fn();
    expect(
      (await handleRevalidate(request({ tag: 'events' }, 'nope'), 's3cret', revalidate)).status,
    ).toBe(401);
    expect((await handleRevalidate(request({ tag: 'events' }), 's3cret', revalidate)).status).toBe(
      401,
    );
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('refuses unknown tags and malformed bodies', async () => {
    const revalidate = vi.fn();
    expect(
      (await handleRevalidate(request({ tag: 'everything' }, 's'), 's', revalidate)).status,
    ).toBe(400);
    expect((await handleRevalidate(request('not json', 's'), 's', revalidate)).status).toBe(400);
    expect((await handleRevalidate(request(null, 's'), 's', revalidate)).status).toBe(400);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('reports a deployment without a secret as misconfigured', async () => {
    expect(
      (await handleRevalidate(request({ tag: 'events' }, 'x'), undefined, vi.fn())).status,
    ).toBe(500);
  });
});
