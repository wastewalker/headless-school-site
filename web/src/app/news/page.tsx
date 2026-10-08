import type { Metadata } from 'next';
import { connection } from 'next/server';
import { ArticleCard } from '@/components/ArticleCard';
import { cms } from '@/lib/cms/config';

export const metadata: Metadata = { title: 'News' };

export default async function NewsPage() {
  // Rendered per request; the CMS data itself is cached by tag (see lib/cms/client.ts).
  await connection();
  const articles = await cms.listArticles({ limit: 50 });
  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>News</h1>
        <p className="lede">What has been happening across the school.</p>
      </header>
      {articles.length > 0 ? (
        <div className="card-grid">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="muted">No news has been published yet.</p>
      )}
    </div>
  );
}
