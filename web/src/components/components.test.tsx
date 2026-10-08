import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Activity, Article, SchoolEvent } from '@/lib/cms/types';
import type { TrackingEvent } from '@/lib/experiment';
import { ActivityCard } from './ActivityCard';
import { ArticleCard } from './ArticleCard';
import { CtaButton } from './CtaButton';
import { EventCard } from './EventCard';
import { LevelPicker } from './LevelPicker';

const event: SchoolEvent = {
  slug: 'open-day',
  title: 'Open day',
  description: 'Tour.',
  startsAt: '2026-10-20T14:00:00.000Z',
  endsAt: '2026-10-20T18:00:00.000Z',
  location: 'Main campus',
  levels: ['primary'],
};

const article: Article = {
  slug: 'reading-week',
  title: 'Reading week',
  excerpt: 'Every class read aloud.',
  body: [],
  category: 'school-life',
  levels: ['kindergarten', 'primary', 'secondary'],
  publishedAt: '2026-10-03T12:00:00.000Z',
};

const activity: Activity = {
  slug: 'robotics',
  name: 'Robotics',
  summary: 'Build robots.',
  category: 'science',
  schedule: 'Wed 15:30',
  openToExternal: true,
  levels: ['secondary'],
};

describe('EventCard', () => {
  it('links to the event and gives a machine-readable time', () => {
    render(<EventCard event={event} />);
    expect(screen.getByRole('link', { name: 'Open day' })).toHaveAttribute(
      'href',
      '/events/open-day',
    );
    expect(screen.getByText(/10:00–14:00/).closest('time')).toHaveAttribute(
      'dateTime',
      event.startsAt,
    );
  });

  it('marks events for the visitor’s level', () => {
    const { rerender } = render(<EventCard event={event} highlight="primary" />);
    expect(screen.getByText('For your family')).toBeInTheDocument();
    rerender(<EventCard event={event} highlight="secondary" />);
    expect(screen.queryByText('For your family')).not.toBeInTheDocument();
  });
});

describe('ArticleCard and ActivityCard', () => {
  it('shows category, date and coverage', () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText(/School life/)).toBeInTheDocument();
    expect(screen.getByText('3 October 2026')).toBeInTheDocument();
    expect(screen.getByText('Whole school')).toBeInTheDocument();
  });

  it('flags clubs open to non-students', () => {
    const { rerender } = render(<ActivityCard activity={activity} />);
    expect(screen.getByText('Open to non-students')).toBeInTheDocument();
    rerender(<ActivityCard activity={{ ...activity, openToExternal: false }} />);
    expect(screen.queryByText('Open to non-students')).not.toBeInTheDocument();
  });
});

describe('LevelPicker', () => {
  it('posts the chosen level and shows which one is active', async () => {
    const action = vi.fn();
    render(<LevelPicker current="primary" action={action} />);
    expect(screen.getByRole('button', { name: 'Primary' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Secondary' }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect((action.mock.calls[0]![0] as FormData).get('level')).toBe('secondary');
  });

  it('offers a reset only once a level is chosen', () => {
    const { rerender } = render(<LevelPicker current={null} action={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Everything' })).not.toBeInTheDocument();
    rerender(<LevelPicker current="secondary" action={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Everything' })).toBeInTheDocument();
  });
});

describe('CtaButton', () => {
  it('records one exposure and a click, tagged with the variant', async () => {
    const sent: TrackingEvent[] = [];
    const send = (e: TrackingEvent) => sent.push(e);
    render(
      <CtaButton href="/visit" label="Book a visit" experiment="exp" variant="B" send={send} />,
    );

    const link = screen.getByRole('link', { name: 'Book a visit' });
    expect(link).toHaveAttribute('data-variant', 'B');
    expect(sent).toEqual([{ experiment: 'exp', variant: 'B', event: 'exposure' }]);

    link.addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(link);
    expect(sent.at(-1)).toEqual({ experiment: 'exp', variant: 'B', event: 'click' });
  });

  it('beacons to /api/track by default', () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
    render(<CtaButton href="/visit" label="Go" experiment="exp" variant="A" />);
    expect(sendBeacon).toHaveBeenCalledWith('/api/track', expect.any(Blob));
  });

  it('falls back to fetch keepalive without sendBeacon', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<CtaButton href="/visit" label="Go" experiment="exp" variant="A" />);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/track',
      expect.objectContaining({ keepalive: true }),
    );
    vi.unstubAllGlobals();
  });
});
