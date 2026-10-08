import type { ReactNode } from 'react';
import type { Block, InlineNode, TextNode } from '@/lib/cms/types';

/**
 * Renders Strapi's "blocks" rich text as React.
 *
 * Written in-house instead of using @strapi/blocks-react-renderer, whose
 * package runs a `husky install` postinstall that fails `npm ci` in any project
 * without husky. The block set is small and stable, and owning it means every
 * node type is rendered on purpose: unknown types render nothing instead of
 * crashing a page, and links are the only place a URL can come from.
 */

function renderText(node: TextNode, key: number): ReactNode {
  let content: ReactNode = node.text;
  if (node.code) content = <code>{content}</code>;
  if (node.bold) content = <strong>{content}</strong>;
  if (node.italic) content = <em>{content}</em>;
  if (node.underline) content = <u>{content}</u>;
  if (node.strikethrough) content = <s>{content}</s>;
  return <span key={key}>{content}</span>;
}

/** Only http(s), mailto and same-site links survive; anything else becomes plain text. */
export function safeHref(url: string): string | null {
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function renderInline(nodes: InlineNode[]): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'link') {
      const href = safeHref(node.url);
      const children = node.children.map(renderText);
      if (!href) return <span key={i}>{children}</span>;
      const external = !href.startsWith('/');
      return (
        <a
          key={i}
          href={href}
          {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
        >
          {children}
        </a>
      );
    }
    return renderText(node, i);
  });
}

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case 'paragraph':
      return <p key={key}>{renderInline(block.children)}</p>;
    case 'heading': {
      // The page title is the only h1; content headings start at h2.
      const level = Math.min(Math.max(block.level, 2), 6) as 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as const;
      return <Tag key={key}>{renderInline(block.children)}</Tag>;
    }
    case 'quote':
      return <blockquote key={key}>{renderInline(block.children)}</blockquote>;
    case 'code':
      return (
        <pre key={key}>
          <code>{block.children.map((c) => c.text).join('')}</code>
        </pre>
      );
    case 'list': {
      const items = block.children.map((item, i) => <li key={i}>{renderInline(item.children)}</li>);
      return block.format === 'ordered' ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
    }
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element -- CMS media has no known dimensions
        <img
          key={key}
          src={block.image.url}
          alt={block.image.alternativeText ?? ''}
          loading="lazy"
        />
      );
    default:
      return null;
  }
}

export function Blocks({ content }: { content: Block[] }) {
  return <div className="prose">{content.map(renderBlock)}</div>;
}
