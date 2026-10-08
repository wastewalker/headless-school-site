import { revalidateTag } from 'next/cache';
import { handleRevalidate } from '@/lib/revalidate';

/** Called by Strapi after an editor saves or publishes (cms/src/revalidate.ts). */
export async function POST(request: Request) {
  const result = await handleRevalidate(request, process.env.REVALIDATE_SECRET, (tag) =>
    // "max": readers get the cached page while the fresh one renders in the background.
    revalidateTag(tag, 'max'),
  );
  return Response.json(result.body, { status: result.status });
}
