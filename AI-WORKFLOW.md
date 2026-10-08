# How AI was used to build this

This project was built in one working session with
[Claude Code](https://claude.com/claude-code). As with
[labour-indicators-dashboard](https://github.com/wastewalker/labour-indicators-dashboard),
most of the code was written by the AI, and this document says so plainly.

---

## The short version

| Area                        | Who drove                                                     |
| --------------------------- | ------------------------------------------------------------- |
| Goal, scope and constraints | Me                                                            |
| Choice of CMS               | Me: Strapi, which the roles I am applying for name explicitly |
| Content and data rules      | Me: fictional school only, no real institution's content      |
| Architecture and features   | Proposed by the AI, accepted by me                            |
| Implementation and tests    | AI-written                                                    |
| Verification                | By running things: compiler, linter, tests, the real Strapi   |

---

## What I decided

- **Why it exists.** I have worked with headless WordPress and Strapi, but none
  of that work is public. This repository makes that experience verifiable.
- **Fictional content, on purpose.** Real institutional content does not belong
  in a public portfolio without permission, so everything here is invented.
- **Strapi over WordPress** for this demo, because it is the headless CMS that
  the job descriptions I am applying to name.

## What the AI proposed and I accepted

- Personalisation by stage of schooling and an A/B test on the homepage
  call-to-action, so the demo covers more than "fetch and render".
- Cache invalidation driven by Strapi saves, through a document-service
  middleware and tag-based revalidation.
- An end-to-end test of the editor workflow against a real Strapi instance,
  instead of a mocked CMS.

---

## What went wrong, and how it was caught

### A hash that split visitors 50/50 and was still wrong

The first A/B assignment was `fnv1a(experiment + id) % 2`. A test that 10,000
random visitors split evenly passed. A second test, that two different
experiments assign visitors independently, failed: every visitor got the same
variant in both. FNV-1a's lowest bit is just the parity of the input
characters' lowest bits, so any two experiment keys with the same parity
produce identical buckets. The fix was a MurmurHash3 finaliser before taking
the bit. A split test alone would never have caught this; it took a test of a
different property.

### The official rich-text renderer breaks installs

`@strapi/blocks-react-renderer` runs `husky install` as a postinstall script,
which fails `npm install` in any project without husky. Anyone cloning the repo
would have hit it. The block set is small, so the renderer was written in-house,
with a link allow-list the official one does not provide.

### End-to-end tests passed once, then failed

The editor test changes a headline. On the second run, Strapi started from a
fresh seeded database, but Next.js served the changed headline from its on-disk
data cache, written by the previous run. The test setup now clears that cache
along with the database. The failure was real, but in the harness, not the
product.

### An assertion counted the navigation

A test expected three list items in an article and found six: the site menu is a
list too. The assertion is now scoped to the article body.

---

## How it was verified

- `tsc` under `strict` and `noUncheckedIndexedAccess`, type-aware ESLint and
  Prettier, all clean. The CMS type-checks and builds.
- 74 unit and component tests at 100% line coverage of `src/lib` and
  `src/components`, with thresholds enforced.
- 9 Playwright tests against the production build and a real Strapi, run twice
  in a row to rule out leftover state.
- Pages checked visually at desktop and mobile widths, in light and dark mode.
