'use server';

import { cookies } from 'next/headers';
import { LEVEL_COOKIE, readLevel } from '@/lib/personalize';

/** Remember which stage of schooling the visitor cares about, or forget it. */
export async function setLevelAction(formData: FormData): Promise<void> {
  const jar = await cookies();
  const level = readLevel(formData.get('level'));
  if (level) {
    jar.set(LEVEL_COOKIE, level, { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
  } else {
    jar.delete(LEVEL_COOKIE);
  }
}
