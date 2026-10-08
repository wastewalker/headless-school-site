import { isTrackingEvent } from '@/lib/experiment';

/**
 * Receives experiment exposures and clicks from the browser.
 *
 * It writes one JSON line per event to the server log, which is the honest
 * extent of this demo: in production this is where events would be forwarded to
 * an analytics store. Nothing identifying is recorded, only the experiment,
 * the variant and what happened.
 */
export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  if (!isTrackingEvent(payload)) {
    return Response.json({ error: 'Invalid tracking event' }, { status: 400 });
  }
  console.info(JSON.stringify({ type: 'experiment', ...payload, at: new Date().toISOString() }));
  return new Response(null, { status: 204 });
}
