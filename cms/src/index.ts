import type { Core } from '@strapi/strapi';
import { registerRevalidation } from './revalidate';
import { grantPublicRead, seed } from './seed';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    registerRevalidation(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicRead(strapi);
    if (process.env.SEED_ON_BOOT !== 'false') {
      const seeded = await seed(strapi);
      if (seeded) strapi.log.info('Seeded the fictional school content');
    }
  },
};
