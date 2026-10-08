import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="reading empty">
      <h1>Page not found</h1>
      <p className="lede">It may have been unpublished, or the link is wrong.</p>
      <Link href="/" className="button button-ghost">
        Back to home
      </Link>
    </section>
  );
}
