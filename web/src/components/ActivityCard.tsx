import type { Activity } from '@/lib/cms/types';
import { ACTIVITY_CATEGORY_LABEL } from '@/lib/format';
import { LevelTags } from './LevelTags';

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="activity-card">
      <p className="kicker">{ACTIVITY_CATEGORY_LABEL[activity.category]}</p>
      <h3>{activity.name}</h3>
      <p>{activity.summary}</p>
      <p className="meta">{activity.schedule}</p>
      <LevelTags levels={activity.levels} />
      {activity.openToExternal ? <p className="pill">Open to non-students</p> : null}
    </article>
  );
}
