import { isForLevel, prioritiseByLevel, readLevel } from './personalize';

const items = [
  { id: 1, levels: ['secondary' as const] },
  { id: 2, levels: ['primary' as const] },
  { id: 3, levels: ['kindergarten' as const, 'primary' as const] },
  { id: 4, levels: [] },
];

describe('prioritiseByLevel', () => {
  it('moves matching items first and keeps order within each group', () => {
    expect(prioritiseByLevel(items, 'primary').map((i) => i.id)).toEqual([2, 3, 1, 4]);
  });

  it('hides nothing', () => {
    expect(prioritiseByLevel(items, 'kindergarten')).toHaveLength(items.length);
  });

  it('returns a copy in the original order without a level', () => {
    const result = prioritiseByLevel(items, null);
    expect(result.map((i) => i.id)).toEqual([1, 2, 3, 4]);
    expect(result).not.toBe(items);
  });
});

describe('level helpers', () => {
  it('reads only known level slugs from a cookie', () => {
    expect(readLevel('primary')).toBe('primary');
    expect(readLevel('admin')).toBeNull();
    expect(readLevel(undefined)).toBeNull();
  });

  it('says whether an item is for the chosen level', () => {
    expect(isForLevel(items[1]!, 'primary')).toBe(true);
    expect(isForLevel(items[0]!, 'primary')).toBe(false);
    expect(isForLevel(items[0]!, null)).toBe(false);
  });
});
