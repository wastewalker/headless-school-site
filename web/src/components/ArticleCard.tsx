import Link from 'next/link';
import type { Article, LevelSlug } from '@/lib/cms/types';
import { ARTICLE_CATEGORY_LABEL, formatDate } from '@/lib/format';
import { LevelTags } from './LevelTags';

export function ArticleCard({
  article,
  highlight,
}: {
  article: Article;
  highlight?: LevelSlug | null;
}) {
  return (
    <article className={`article-card cat-${article.category}`}>
      <p className="kicker">
        {ARTICLE_CATEGORY_LABEL[article.category]}
        <span aria-hidden="true"> · </span>
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <h3>
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h3>
      <p>{article.excerpt}</p>
      <LevelTags levels={article.levels} highlight={highlight ?? null} />
    </article>
  );
}
