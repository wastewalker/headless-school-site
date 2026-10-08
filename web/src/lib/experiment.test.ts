import {
  HOME_CTA_EXPERIMENT,
  assignVariant,
  fnv1a,
  forcedVariant,
  isTrackingEvent,
  mix32,
} from './experiment';

describe('assignVariant', () => {
  it('is stable for the same visitor and experiment', () => {
    const first = assignVariant('visitor-123', HOME_CTA_EXPERIMENT);
    for (let i = 0; i < 5; i++)
      expect(assignVariant('visitor-123', HOME_CTA_EXPERIMENT)).toBe(first);
  });

  it('splits a population roughly in half', () => {
    let a = 0;
    const n = 10_000;
    for (let i = 0; i < n; i++)
      if (assignVariant(crypto.randomUUID(), HOME_CTA_EXPERIMENT) === 'A') a++;
    // 3 standard deviations for n = 10,000 is about ±150.
    expect(Math.abs(a - n / 2)).toBeLessThan(200);
  });

  it('assigns independently per experiment', () => {
    let differs = 0;
    for (let i = 0; i < 200; i++) {
      const id = `visitor-${i}`;
      if (assignVariant(id, 'exp-one') !== assignVariant(id, 'exp-two')) differs++;
    }
    expect(differs).toBeGreaterThan(50);
    expect(differs).toBeLessThan(150);
  });

  it('splits sequential ids evenly too, not just random ones', () => {
    let a = 0;
    for (let i = 0; i < 1000; i++)
      if (assignVariant(`visitor-${i}`, HOME_CTA_EXPERIMENT) === 'A') a++;
    expect(Math.abs(a - 500)).toBeLessThan(75);
  });

  it('finalises the hash so neighbouring inputs land far apart', () => {
    expect(mix32(0)).toBe(0);
    expect(mix32(1)).not.toBe(mix32(2));
    expect((mix32(1) ^ mix32(3)).toString(2).replace(/0/g, '').length).toBeGreaterThan(8);
  });

  it('uses the reference FNV-1a values', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
  });
});

describe('forcedVariant', () => {
  it('accepts only A or B', () => {
    expect(forcedVariant('A')).toBe('A');
    expect(forcedVariant('B')).toBe('B');
    expect(forcedVariant('C')).toBeNull();
    expect(forcedVariant(['A'])).toBeNull();
    expect(forcedVariant(undefined)).toBeNull();
  });
});

describe('isTrackingEvent', () => {
  it('accepts well-formed events', () => {
    expect(isTrackingEvent({ experiment: 'x', variant: 'A', event: 'click' })).toBe(true);
    expect(isTrackingEvent({ experiment: 'x', variant: 'B', event: 'exposure' })).toBe(true);
  });

  it.each([
    null,
    'click',
    { experiment: '', variant: 'A', event: 'click' },
    { experiment: 'x'.repeat(65), variant: 'A', event: 'click' },
    { experiment: 'x', variant: 'C', event: 'click' },
    { experiment: 'x', variant: 'A', event: 'purchase' },
  ])('rejects %j', (value) => {
    expect(isTrackingEvent(value)).toBe(false);
  });
});
