import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Visit us' };

export default function VisitPage() {
  return (
    <article className="reading">
      <h1>Visit us</h1>
      <p className="lede">
        This is where the call-to-action leads. In a real site it would open a booking form; this
        demo stops here on purpose and collects no personal data.
      </p>
      <p>
        The button that brought you here is an A/B test: half of visitors see one label and half the
        other, both written by editors in the CMS.
      </p>
      <Link href="/" className="button button-ghost">
        Back to home
      </Link>
    </article>
  );
}
