import type { LevelSlug } from '@/lib/cms/types';
import { describeLevels } from '@/lib/format';

export function LevelTags({
  levels,
  highlight,
}: {
  levels: LevelSlug[];
  highlight?: LevelSlug | null;
}) {
  const forYou = highlight != null && levels.includes(highlight);
  return (
    <p className="tags">
      <span>{describeLevels(levels)}</span>
      {forYou ? <span className="tag-you">For your family</span> : null}
    </p>
  );
}
