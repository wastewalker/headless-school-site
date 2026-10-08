'use client';

import { useEffect } from 'react';

/** Shown when the CMS cannot be reached or answers with an error. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="reading empty" role="alert">
      <h1>We could not load this page</h1>
      <p className="lede">The content service may be unavailable. Please try again in a moment.</p>
      <button type="button" className="button button-primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
