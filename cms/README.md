# cms

Strapi 5 instance for the fictional Altamira Trilingual School. See the
[repository README](../README.md) for how it fits with the frontend.

```bash
cp .env.example .env   # demo secrets; replace them for anything public
npm ci
npm run develop        # http://localhost:1337/admin
```

On first boot it:

- seeds levels, news, events, clubs and the homepage copy (`src/seed/`),
- grants the public role read-only access to those types (`src/seed/index.ts`),
- registers a document-service middleware that notifies the frontend after
  every save or publish (`src/revalidate.ts`), when `FRONTEND_REVALIDATE_URL`
  and `FRONTEND_REVALIDATE_SECRET` are set.

Content types live in `src/api/*/content-types/*/schema.json`.
