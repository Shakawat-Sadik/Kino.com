# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Project

Next.js 16 (App Router, Turbopack) frontend for Kino.com, a second-hand
marketplace. Auth via BetterAuth (JWT plugin + Mongo adapter). Data comes
from a separate Express backend (`SERVER_URL` / `REMOTE_SERVER_URL`), called
through server actions in [src/lib/action/action.js](src/lib/action/action.js).
Package manager is **pnpm** — `next` is not on PATH directly, so run
`pnpm build` / `pnpm dev`, not bare `next ...`.

## Performance workstream

This is an ongoing effort to improve TTFB, LCP, and INP. Findings and the
phased plan below were produced by a code inspection + `pnpm build` route
analysis on 2026-10-02. Re-run `pnpm build` after any data/caching change —
the route table (`○` static vs `ƒ` dynamic) is the fastest signal of
whether a change actually helped.

### Baseline findings

**1. No caching anywhere (fixed in Phase 1, see below)**
- [action.js](src/lib/action/action.js) `fetchAPI()` used `cache: "no-store"`
  for *every* request, including public reads (products, reviews, stats,
  top sellers). This forced `/`, `/products/[id]`, etc. to be fully dynamic
  (`ƒ` in the build output) — every visitor waited on the Express backend.
- Every response was also logged with `console.log`, adding overhead to
  every request.

**2. Extra round-trip on every protected request**
- [integra.js](src/lib/action/integra.js) `getAuthHeaders()` calls the
  app's own `/api/auth/token` endpoint over HTTP to mint a JWT, then
  `fetchAPI` calls Express. That's two sequential network calls for any
  authenticated read/write. Better-auth likely exposes an in-process way to
  get the token (e.g. `auth.api.getToken({ headers })`) that would avoid the
  extra HTTP hop — not yet done, worth checking.
- Session gets checked up to 3x per dashboard visit: [proxy.js](src/proxy.js)
  (server), [RoleGuard.jsx](src/components/All/auth/RoleGuard.jsx) (client),
  and some dashboard pages call `auth.api.getSession` again directly.

**3. Client-side fetch waterfalls**
- [ProductsClient.jsx](src/components/All/Products/ProductsClient.jsx) and
  ~13 dashboard pages fetch data inside `useEffect` via server actions.
  Server actions are POST requests — not cacheable, and Next runs them
  sequentially. Sequence is: HTML → JS download → hydrate → action call →
  Express. This hurts LCP/SEO on `/products` (ships an empty skeleton) and
  compounds with RoleGuard's own session-wait on dashboard pages (two
  waits in a row: session, then data).
- Not yet addressed — see Phase 2 below.

**4. Bundle size**
- 105 files are `"use client"`, including every home-page section, mostly
  just to run `motion` entrance animations.
- `motion/react` (full import, not `LazyMotion`/`m`) used in ~45 files.
- Three headless UI libs present: `radix-ui`, `@base-ui/react`,
  `react-aria-components` — worth auditing with a bundle analyzer
  (`pnpm next build` prints route JS sizes; Turbopack's
  `experimental-analyze` flag can break this down further) to see if one
  can be dropped.
- `recharts` imported directly in dashboard chart pages instead of
  `next/dynamic`-loaded.
- Not yet addressed — see Phase 3 below.

**5. Images / paint**
- `unoptimized` set on profile + checkout images (skips Next's image
  optimizer).
- [next.config.mjs](next.config.mjs) has a catch-all `hostname: "**"`
  remote pattern, making the specific entries above it redundant and
  allowing the image optimizer to be used as an open proxy for any URL.
- Only `ImageGallery` sets `priority`; the home page's actual LCP image
  does not.
- ~67 uses of `filter: blur(...)` / `backdrop-blur` animations — expensive
  to paint on mid-range mobile, can hurt INP.
- Not yet addressed — see Phase 4 below.

### Phased workflow

**Phase 0 – Measure** (done once, re-run after each phase)
- `pnpm build` → check the route table for `○` vs `ƒ`.
- Bundle size per route from the build output / analyzer.
- Lighthouse/PageSpeed (mobile) on `/`, `/products`, `/products/[id]`,
  `/dashboard/seller` for LCP, INP, CLS, TTFB. Vercel Speed Insights for
  real-user data if available.
- Time the Express endpoints directly — frontend fixes can't outrun a
  slow backend.

**Phase 1 – Data layer caching — ✅ DONE (commit `289e728`)**
- Split `fetchAPI` so public reads use
  `next: { revalidate: 60, tags: [...] }` (ISR) and protected reads keep
  `cache: "no-store"`.
- Removed per-request `console.log`/response logging from `fetchAPI` and
  `getAuthHeaders`.
- Result: `/` moved from `ƒ` to `○` with a 1-minute revalidate window.
- **Still open in this phase:** call `revalidateTag(...)` after product
  mutations (create/update/delete) so the 60s window doesn't serve stale
  data after a seller edits a listing; wrap `getProductById` in React
  `cache()` to dedupe the `generateMetadata` + page-body calls on
  `/products/[id]` (attempted, not yet landed — see note below);
  `/products/[id]` is still `ƒ`, likely needs `generateStaticParams` for
  popular products or the same ISR treatment as `/`.

**Phase 2 – Rendering architecture (not started)**
- Convert `/products` filtering to a server component reading
  `searchParams`, keep only the filter controls as a client component —
  removes the `useEffect` fetch waterfall in `ProductsClient.jsx`.
- Move role checks into dashboard layouts server-side; remove the
  client-side `RoleGuard` wait-then-fetch double waterfall.
- Convert the ~13 dashboard pages that fetch via `useEffect` + server
  action to server-side fetch + props, keeping server actions for
  mutations only.
- Add per-route `loading.jsx`/`Suspense` so pages can stream.

**Phase 3 – JS bundle (not started)**
- `LazyMotion` + `m` instead of full `motion/react` imports; let more
  home-page sections stay server components by isolating animation into
  small client leaves.
- `next/dynamic` for `recharts` on dashboard pages.
- Bundle-analyzer pass to decide whether `radix-ui` / `@base-ui/react` /
  `react-aria-components` can be consolidated.

**Phase 4 – Images & paint (not started)**
- Remove `unoptimized` on profile/checkout images; add `priority` + correct
  `sizes` to LCP images (home page hero/first product).
- Remove the `hostname: "**"` wildcard from `next.config.mjs` image
  remote patterns.
- Reduce `filter: blur` entrance animations / large-surface
  `backdrop-blur` in favor of opacity/transform.

**Process notes**
- One PR per phase, re-measure (Phase 0 checks) after each before moving
  on, so regressions/wins are attributable.
- Phases 1–2 are expected to matter most for TTFB/LCP; Phase 3 matters
  most on mobile JS parse/execute time; Phase 4 is lower-risk polish.
