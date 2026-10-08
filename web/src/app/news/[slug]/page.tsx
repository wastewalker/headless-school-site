import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Blocks } from '@/components/Blocks';
import { LevelTags } from '@/components/LevelTags';
import { cms } from '@/lib/cms/config';
import { ARTICLE_CATEGORY_LABEL, formatDate } from '@/lib/format';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await cms.getArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt } : { title: 'News' };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const article = await cms.getArticle((await params).slug);
  if (!article) notFound();
  return (
    <article className="reading">
      <Link href="/news" className="back">
        ← All news
      </Link>
      <p className="kicker">
        {ARTICLE_CATEGORY_LABEL[article.category]}
        <span aria-hidden="true"> · </span>
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <h1>{article.title}</h1>
      <p className="lede">{article.excerpt}</p>
      <LevelTags levels={article.levels} />
      <Blocks content={article.body} />
    </article>
  );
}
