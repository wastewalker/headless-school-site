/**
 * Two layers of types.
 *
 * `Raw*` mirror what Strapi 5's REST API returns (flattened attributes,
 * `documentId`, nullable optional fields). The domain types below are what the
 * UI works with. Mapping between them happens in one place (map.ts), so a
 * change in Strapi's response shape is a change to one file.
 */

export const LEVEL_SLUGS = ['kindergarten', 'primary', 'secondary'] as const;
export type LevelSlug = (typeof LEVEL_SLUGS)[number];

export type ArticleCategory = 'school-life' | 'academics' | 'sports' | 'community';
export type ActivityCategory = 'sports' | 'arts' | 'science' | 'languages' | 'leadership';

/* ---------- Strapi rich text ("blocks") ---------- */

export interface TextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface LinkNode {
  type: 'link';
  url: string;
  children: TextNode[];
}

export type InlineNode = TextNode | LinkNode;

export type Block =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'code'; children: TextNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: ListItemBlock[] }
  | { type: 'image'; image: { url: string; alternativeText?: string | null } };

export interface ListItemBlock {
  type: 'list-item';
  children: InlineNode[];
}

/* ---------- Raw API shapes ---------- */

export interface StrapiCollection<T> {
  data: T[];
  meta: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

export interface StrapiSingle<T> {
  data: T | null;
}

interface RawBase {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface RawLevel extends RawBase {
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

export interface RawArticle extends RawBase {
  title: string;
  slug: string;
  excerpt: string;
  body: Block[];
  category: ArticleCategory;
  levels?: RawLevel[];
}

export interface RawEvent extends RawBase {
  title: string;
  slug: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  levels?: RawLevel[];
}

export interface RawActivity extends RawBase {
  name: string;
  slug: string;
  summary: string;
  category: ActivityCategory;
  schedule: string;
  openToExternal: boolean;
  levels?: RawLevel[];
}

export interface RawHome extends RawBase {
  heroTitle: string;
  heroSubtitle: string;
  ctaVariantA: string;
  ctaVariantB: string;
  ctaUrl: string;
}

/* ---------- Domain types ---------- */

export interface Level {
  slug: LevelSlug;
  name: string;
  description: string;
  order: number;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: Block[];
  category: ArticleCategory;
  levels: LevelSlug[];
  publishedAt: string;
}

export interface SchoolEvent {
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  levels: LevelSlug[];
}

export interface Activity {
  slug: string;
  name: string;
  summary: string;
  category: ActivityCategory;
  schedule: string;
  openToExternal: boolean;
  levels: LevelSlug[];
}

export interface Home {
  heroTitle: string;
  heroSubtitle: string;
  cta: { A: string; B: string };
  ctaUrl: string;
}
