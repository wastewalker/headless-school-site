import { render, screen } from '@testing-library/react';
import type { Block } from '@/lib/cms/types';
import { Blocks, safeHref } from './Blocks';

describe('Blocks', () => {
  it('renders paragraphs with inline formatting', () => {
    render(
      <Blocks
        content={[
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Plain ' },
              { type: 'text', text: 'bold', bold: true },
              { type: 'text', text: ' and ' },
              { type: 'text', text: 'italic', italic: true },
              { type: 'text', text: ' code', code: true },
              { type: 'text', text: ' u', underline: true },
              { type: 'text', text: ' s', strikethrough: true },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText('bold').closest('strong')).not.toBeNull();
    expect(screen.getByText('italic').closest('em')).not.toBeNull();
    expect(screen.getByText('code').closest('code')).not.toBeNull();
  });

  it('never renders a second h1', () => {
    render(
      <Blocks
        content={[{ type: 'heading', level: 1, children: [{ type: 'text', text: 'Title' }] }]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Title' }).tagName).toBe('H2');
  });

  it('renders lists, quotes, code and images', () => {
    const content: Block[] = [
      {
        type: 'list',
        format: 'ordered',
        children: [{ type: 'list-item', children: [{ type: 'text', text: 'one' }] }],
      },
      {
        type: 'list',
        format: 'unordered',
        children: [{ type: 'list-item', children: [{ type: 'text', text: 'dot' }] }],
      },
      { type: 'quote', children: [{ type: 'text', text: 'Said someone' }] },
      { type: 'code', children: [{ type: 'text', text: 'npm test' }] },
      { type: 'image', image: { url: 'https://cms.test/a.jpg', alternativeText: 'A garden' } },
    ];
    const { container } = render(<Blocks content={content} />);
    expect(container.querySelector('ol li')).toHaveTextContent('one');
    expect(container.querySelector('ul li')).toHaveTextContent('dot');
    expect(container.querySelector('blockquote')).toHaveTextContent('Said someone');
    expect(container.querySelector('pre code')).toHaveTextContent('npm test');
    expect(screen.getByRole('img', { name: 'A garden' })).toHaveAttribute(
      'src',
      'https://cms.test/a.jpg',
    );
  });

  it('opens external links safely and keeps internal ones in the tab', () => {
    render(
      <Blocks
        content={[
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: 'https://example.org',
                children: [{ type: 'text', text: 'outside' }],
              },
              { type: 'link', url: '/events', children: [{ type: 'text', text: 'inside' }] },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'outside' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: 'inside' })).not.toHaveAttribute('target');
  });

  it('renders dangerous links as text', () => {
    render(
      <Blocks
        content={[
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: 'javascript:alert(1)',
                children: [{ type: 'text', text: 'click' }],
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('click')).toBeInTheDocument();
  });

  it('ignores block types it does not know', () => {
    const { container } = render(<Blocks content={[{ type: 'video' } as unknown as Block]} />);
    expect(container.querySelector('.prose')).toBeEmptyDOMElement();
  });
});

describe('safeHref', () => {
  it.each([
    ['/news', '/news'],
    ['https://example.org/a', 'https://example.org/a'],
    ['mailto:office@example.org', 'mailto:office@example.org'],
    ['//evil.example', null],
    ['data:text/html,hi', null],
    ['not a url', null],
  ])('%s -> %s', (input, expected) => {
    expect(safeHref(input)).toBe(expected);
  });
});
