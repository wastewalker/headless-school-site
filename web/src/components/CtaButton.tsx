'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { TrackingEvent, Variant } from '@/lib/experiment';

interface CtaButtonProps {
  href: string;
  label: string;
  experiment: string;
  variant: Variant;
  /** Injected for tests; defaults to a beacon to /api/track. */
  send?: (event: TrackingEvent) => void;
}

function beacon(event: TrackingEvent): void {
  const body = JSON.stringify(event);
  // sendBeacon survives the navigation the click triggers; fetch keepalive is the fallback.
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
  } else {
    void fetch('/api/track', {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * The A/B tested call-to-action. Records one exposure when shown and a click
 * when used. The variant is decided on the server, so this component never
 * flickers between labels.
 */
export function CtaButton({ href, label, experiment, variant, send = beacon }: CtaButtonProps) {
  useEffect(() => {
    send({ experiment, variant, event: 'exposure' });
  }, [experiment, variant, send]);

  return (
    <Link
      href={href}
      className="button button-primary button-lg"
      data-experiment={experiment}
      data-variant={variant}
      onClick={() => send({ experiment, variant, event: 'click' })}
    >
      {label}
    </Link>
  );
}
