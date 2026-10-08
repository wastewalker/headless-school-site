import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Altamira Trilingual School', template: '%s · Altamira Trilingual School' },
  description:
    'A fictional school website: Next.js rendering news, events and clubs from a headless Strapi CMS.',
};

const NAV = [
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
  { href: '/activities', label: 'Clubs' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                A
              </span>
              <span>
                Altamira
                <span className="brand-sub">Trilingual School</span>
              </span>
            </Link>
            <nav aria-label="Main">
              <ul className="nav">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
        <main id="main" className="wrap">
          {children}
        </main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              Altamira Trilingual School is fictional. All content is demo data served by a headless
              Strapi CMS.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
