import { isLevelSlug } from './cms/map';
import type { LevelSlug } from './cms/types';

export const LEVEL_COOKIE = 'level';

export function readLevel(value: unknown): LevelSlug | null {
  return isLevelSlug(value) ? value : null;
}

/**
 * Put content tagged with the visitor's level first, keeping the CMS order
 * within each group. Nothing is hidden: a parent of a primary pupil still sees
 * the whole-school events, just after the ones meant for them.
 */
export function prioritiseByLevel<T extends { levels: LevelSlug[] }>(
  items: readonly T[],
  level: LevelSlug | null,
): T[] {
  if (!level) return [...items];
  const matching: T[] = [];
  const rest: T[] = [];
  for (const item of items) (item.levels.includes(level) ? matching : rest).push(item);
  return [...matching, ...rest];
}

export function isForLevel(item: { levels: LevelSlug[] }, level: LevelSlug | null): boolean {
  return level !== null && item.levels.includes(level);
}
