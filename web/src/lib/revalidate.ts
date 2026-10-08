import { TAGS } from './cms/client';

const KNOWN_TAGS = new Set<string>(Object.values(TAGS));

export type RevalidateResult =
  | { status: 200; body: { revalidated: string } }
  | { status: 400 | 401 | 500; body: { error: string } };

/**
 * The logic behind POST /api/revalidate, kept free of Next.js imports so it is
 * unit-tested directly. `revalidate` is injected (Next's revalidateTag in the
 * route handler, a spy in tests).
 *
 * Unknown tags are refused instead of passed through: a typo in the CMS hook
 * should fail loudly here, not silently invalidate nothing.
 */
export async function handleRevalidate(
  request: Request,
  expectedSecret: string | undefined,
  revalidate: (tag: string) => void,
): Promise<RevalidateResult> {
  if (!expectedSecret) {
    return { status: 500, body: { error: 'Revalidation is not configured on this deployment' } };
  }
  if (request.headers.get('x-revalidate-secret') !== expectedSecret) {
    return { status: 401, body: { error: 'Invalid revalidation secret' } };
  }
  const payload: unknown = await request.json().catch(() => null);
  const tag =
    typeof payload === 'object' && payload !== null ? (payload as { tag?: unknown }).tag : null;
  if (typeof tag !== 'string' || !KNOWN_TAGS.has(tag)) {
    return {
      status: 400,
      body: { error: `Unknown tag. Expected one of: ${[...KNOWN_TAGS].join(', ')}` },
    };
  }
  revalidate(tag);
  return { status: 200, body: { revalidated: tag } };
}
