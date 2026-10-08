import 'server-only';
import { createCmsClient } from './client';

/** The app's CMS client. Server-only: the token, if any, never reaches the browser. */
export const cms = createCmsClient({
  baseUrl: process.env.STRAPI_URL ?? 'http://localhost:1337',
  token: process.env.STRAPI_TOKEN,
  revalidate: Number(process.env.CMS_REVALIDATE_SECONDS ?? 300),
});
