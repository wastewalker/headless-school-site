# Headless School Site

[![Next.js](https://img.shields.io/badge/next.js-16-black)](https://nextjs.org)
[![Strapi](https://img.shields.io/badge/strapi-5-4945ff)](https://strapi.io)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)](./web/tsconfig.json)

A school website built on a headless CMS: editors manage news, events and clubs
in **Strapi**, and a **Next.js** frontend renders them, personalises the
homepage by stage of schooling, and runs an A/B test on its call-to-action.

> **What this is.** A demonstration of headless-CMS integration and the
> engineering around it: a typed content client, cache invalidation driven by
> CMS saves, cookie-based personalisation, deterministic A/B assignment, and
> unit, component and end-to-end tests against a real Strapi instance.
>
> **What this is not.** A real school. _Altamira Trilingual School_ and all of
> its content are invented. See [Limitations](#limitations).
>
> **How it was built.** With Claude Code. [AI-WORKFLOW.md](./AI-WORKFLOW.md)
> records what was decided, what was generated, and what went wrong.

---

## Contents

- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Content model](#content-model)
- [Design decisions](#design-decisions)
- [Testing strategy](#testing-strategy)
- [CI](#ci)
- [Limitations](#limitations)

---

## Architecture

```
 Editor ──► Strapi 5 (cms/)                      Visitor ──► Next.js 16 (web/)
            │ content types, seed,                           │ Server Components
            │ public read-only role                          │ typed CMS client
            │                                                │ (fetch tagged per type)
            │◄────────── REST: /api/articles, /api/events … ─┤
            │                                                │
            └── after every save/publish ──► POST /api/revalidate { tag }
                (document-service middleware)   └─► revalidateTag(tag)
```

- The browser never talks to Strapi. Pages are Server Components, and the CMS
  URL and optional token live in a `server-only` module.
- Every CMS request carries a cache tag (`articles`, `events`, …). When an
  editor saves, Strapi tells the frontend which tag changed, and only those
  pages refresh. A 5-minute time-based refresh covers a missed hook.

## Quick start

Requires Node 22. Two terminals:

```bash
# 1. CMS — http://localhost:1337/admin (create the first admin on first visit)
cd cms
cp .env.example .env
npm ci
npm run develop
```

```bash
# 2. Frontend — http://localhost:3000
cd web
cp .env.example .env.local
npm ci
npm run dev
```

On first boot Strapi seeds the fictional school and opens read access to the
public role, so the site has content immediately. Set the same secret in
`cms/.env` (`FRONTEND_REVALIDATE_SECRET`) and `web/.env.local`
(`REVALIDATE_SECRET`) to see edits appear on the site as soon as they are
published.

### Checks

```bash
cd web
npm run lint && npm run typecheck
npm test                         # unit and component tests
npm run test:coverage            # with the thresholds CI enforces
npx playwright install chromium
npm run test:e2e                 # needs cms/ built once: (cd ../cms && npm run build)
```

## Content model

| Type     | Kind       | Fields                                                          |
| -------- | ---------- | --------------------------------------------------------------- |
| Level    | collection | name, slug, description, order                                  |
| Article  | collection | title, slug, excerpt, body (rich text blocks), category, levels |
| Event    | collection | title, slug, description, startsAt, endsAt, location, levels    |
| Activity | collection | name, slug, summary, category, schedule, openToExternal, levels |
| Home     | single     | heroTitle, heroSubtitle, ctaVariantA, ctaVariantB, ctaUrl       |

Articles, events and activities relate many-to-many to levels. That one
relation is what powers both the personalised homepage and the club filter.

## Design decisions

**Two type layers.** `Raw*` types mirror Strapi's REST responses; domain types
are what components use. `lib/cms/map.ts` is the only place that knows
Strapi's shape, so a CMS upgrade or migration changes one file. Unknown levels
an editor adds are dropped rather than crashing a page, because a new level
needs design work before it can render.

**Queries as data.** Strapi filters are nested objects serialised with `qs`, as
Strapi recommends. Each query is a plain function (`lib/cms/query.ts`) tested
by its output string. An event that has started but not ended still counts as
upcoming: the cut-off is `endsAt`, falling back to `startsAt`.

**Invalidation on save, not on a timer.** A Strapi document-service middleware
(`cms/src/revalidate.ts`) posts the changed type's tag to the frontend after
every create, update, publish, unpublish or delete. It fires and forgets, so a
frontend outage never blocks an editor. The frontend's handler refuses unknown
tags and wrong secrets, and uses `revalidateTag(tag, 'max')`: readers keep
getting the cached page while the fresh one renders.

**Personalisation without accounts.** Families choose a stage of schooling
(kindergarten, primary, secondary). It is stored in a cookie by a server
action, so it works without JavaScript. Matching content moves to the top and
is marked "For your family"; nothing is hidden.

**A/B testing that cannot flicker.** `proxy.ts` gives each visitor a random id
on their first request, written to both the response and the forwarded
request so even the first render is assigned. The variant is a pure hash of
id and experiment key, decided on the server, so the label never changes after
load. Editors write both labels in the CMS. Exposure and click events are sent
with `sendBeacon` to `/api/track`, which logs one JSON line per event.

**Rich text rendered in-house.** Strapi's official blocks renderer runs a
`husky install` postinstall that breaks `npm ci` in any project without husky.
The block set is small, so `components/Blocks.tsx` renders it directly. Links
pass through an allow-list (`http`, `https`, `mailto`, same-site paths), and
`javascript:` or protocol-relative URLs become plain text.

**Time zone.** Event times render in the school's zone (UTC−4) on both server
and client, so an evening event never shows up on the wrong day.

## Testing strategy

**Unit and component (Vitest, React Testing Library): 74 tests.** Query
building, response mapping, the client (with injected `fetch`), A/B assignment
(stability, 50/50 split on random and sequential ids, independence between
experiments), personalisation ordering, time-zone formatting, the revalidation
handler, the rich-text renderer including link sanitising, and the components.
Coverage thresholds are enforced on `src/lib` and `src/components`.

**End-to-end (Playwright): 9 tests against the real stack.** Each run boots
Strapi on a fresh SQLite database, seeded on start, and the production build of
the frontend. The tests cover both CTA variants and variant stickiness,
personalisation and its persistence, rich text, the event calendar, the club
filter, 404s and the revalidation hook's secret check.

The editor test is the important one. It registers a throwaway admin on the
fresh database, edits a headline through Strapi's Content Manager API,
publishes it, and checks the site shows the new headline well before the
5-minute fallback. That proves the whole chain: Strapi middleware, webhook,
tag invalidation and re-render.

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

1. **web-quality**: Prettier, ESLint, TypeScript.
2. **web-unit**: Vitest with coverage thresholds.
3. **cms-build**: TypeScript check and Strapi build.
4. **e2e**: after all three pass, builds both apps and runs Playwright against
   the real Strapi.

## Limitations

- **Fictional content, no media.** Images are not seeded; cards use type
  instead. The rich-text renderer supports images when editors add them.
- **One language.** The school is "trilingual" in the story, but Strapi's i18n
  plugin is not enabled. That would be the next step for a real school.
- **A/B assignment and exposure only.** There is no analytics store or
  significance test; `/api/track` logs events where a real sink would go.
- **SQLite.** Fine for a demo and for CI; a real deployment would point Strapi
  at PostgreSQL through the existing `DATABASE_*` settings.
- **Seed dates are relative.** Events are scheduled relative to the first boot,
  so a long-running demo database will eventually run out of upcoming events.
