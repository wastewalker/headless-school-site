import { LEVEL_SLUGS } from '@/lib/cms/types';
import type { LevelSlug } from '@/lib/cms/types';
import { LEVEL_LABEL } from '@/lib/format';

interface LevelPickerProps {
  current: LevelSlug | null;
  /** A server action that stores the choice. Passed in so the component is testable. */
  action: (formData: FormData) => void | Promise<void>;
}

/**
 * Personalisation entry point. A plain form posting to a server action, so it
 * works before JavaScript loads and the choice survives as a cookie.
 */
export function LevelPicker({ current, action }: LevelPickerProps) {
  return (
    <form action={action} className="level-picker" aria-label="Personalise for your family">
      <p className="level-picker-label">Show me what matters for</p>
      <div className="segmented" role="group">
        {LEVEL_SLUGS.map((slug) => (
          <button
            key={slug}
            type="submit"
            name="level"
            value={slug}
            aria-pressed={current === slug}
            className={current === slug ? 'seg seg-on' : 'seg'}
          >
            {LEVEL_LABEL[slug]}
          </button>
        ))}
        {current ? (
          <button type="submit" name="level" value="" className="seg seg-clear">
            Everything
          </button>
        ) : null}
      </div>
    </form>
  );
}
