/**
 * A/B assignment for the homepage call-to-action.
 *
 * Each visitor gets a random id once (set by src/proxy.ts). The variant is a
 * pure function of that id and the experiment's key, so:
 *   - a visitor sees the same variant on every visit and every page render;
 *   - a new experiment reshuffles visitors independently of older ones;
 *   - the split is testable without mocking randomness.
 *
 * This is assignment and exposure only. Deciding a winner needs an analytics
 * store and a significance test, which are out of scope for a demo.
 */

export const VISITOR_COOKIE = 'vid';
export const HOME_CTA_EXPERIMENT = 'home-cta-2026-10';

export type Variant = 'A' | 'B';

/** 32-bit FNV-1a: tiny, fast, and evenly spread for short ASCII keys. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * MurmurHash3's 32-bit finaliser. FNV-1a alone is a poor bucket source: its
 * lowest bit is just the parity of the input characters' lowest bits, so
 * `fnv1a(x) % 2` put every visitor in the same variant for any two experiments
 * whose keys share that parity. The finaliser spreads every input bit across
 * every output bit before we take one.
 */
export function mix32(hash: number): number {
  let h = hash;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function assignVariant(visitorId: string, experiment: string): Variant {
  return mix32(fnv1a(`${experiment}:${visitorId}`)) % 2 === 0 ? 'A' : 'B';
}

/**
 * Lets QA and screenshots pin a variant with `?variant=A|B`. Anything else is
 * ignored, so a malformed link cannot put a visitor in a third bucket.
 */
export function forcedVariant(value: unknown): Variant | null {
  return value === 'A' || value === 'B' ? value : null;
}

export interface TrackingEvent {
  experiment: string;
  variant: Variant;
  event: 'exposure' | 'click';
}

export function isTrackingEvent(value: unknown): value is TrackingEvent {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.experiment === 'string' &&
    v.experiment.length > 0 &&
    v.experiment.length <= 64 &&
    (v.variant === 'A' || v.variant === 'B') &&
    (v.event === 'exposure' || v.event === 'click')
  );
}
