# Performance workstream — prompt pack

Copy-paste prompts for the phases in [CLAUDE.md](../CLAUDE.md). CLAUDE.md is
loaded automatically every session, so these prompts deliberately do **not**
repeat its context.

Each prompt body sits between a pair of `---` rules. Copy everything between
them, nothing else.

## Rules of use

- **One prompt per session.** Run it, review, commit, `/clear`. Session history
  is re-sent on every turn, so a long session is the main thing that makes a
  task expensive.
- **Switch model with `/model` before sending** (noted per prompt).
- **Plan prompts are read-only.** Approve the plan, `/clear`, then send the
  matching build prompt in a fresh session.
- **Update CLAUDE.md** when a phase closes (prompt 10) so later sessions don't
  redo finished work.

### Model guide

| Model | Use for |
| --- | --- |
| `claude-haiku-4-5-20251001` | Mechanical, single-pattern edits across known files (image props, config lines, import swaps). |
| `claude-sonnet-5-5` | Normal implementation in files you've named; build-and-report loops. |
| `claude-opus-5` | Architecture decisions, multi-file rewrites, anything where a wrong direction is costly. |

## Phase 1 — close out the leftovers

### 1. Cache invalidation + per-resource tags

**Model:** `claude-sonnet-5-5` · **When:** first, before anything else — Phase 1
currently serves stale data for 60s after a seller edits a listing.

---

In `src/lib/action/action.js`, two fixes to the Phase 1 caching work.

1. `fetchAPI` currently attaches all four tags (`products`, `reviews`,
   `sellers`, `stats`) to every public read, so invalidating one resource
   invalidates all of them. Change it so each public read declares only the
   tags it actually belongs to — pass the tags in from the calling function
   rather than hardcoding the array in `fetchAPI`.
2. Add `revalidateTag` calls to the mutations that change public data:
   `createProduct`, `updateProduct`, `deleteProduct`, `updateProductStatus`,
   `updateAdminProduct`, `deleteAdminProduct`, `addReview`, `confirmPayment`.
   Each should revalidate only the tags its data feeds.

Don't change any other behaviour. Run `pnpm build` and confirm the route table
is unchanged (`/` still `○`). Short summary: files changed + build result.

---

### 2. Dedupe `getProductById`

**Model:** `claude-sonnet-5-5` · **When:** after prompt 1. Noted in CLAUDE.md as
"attempted, not yet landed" — so expect a wrinkle; let me report it rather than
force it.

---

`/products/[id]` calls `getProductById` twice per request (once in
`generateMetadata`, once in the page body). Wrap it in React `cache()` so the
two calls dedupe.

CLAUDE.md notes this was attempted before and didn't land. If `cache()` can't
wrap it as-is (e.g. because the module is `"use server"`), tell me why and
propose the smallest alternative instead of working around it. Don't refactor
the file beyond this.

---

### 3. Make `/products/[id]` static

**Model:** `claude-opus-5` · **When:** last in Phase 1. It's a rendering-strategy
call, not a mechanical edit.

---

`/products/[id]` is still `ƒ` in the build output. Decide between
`generateStaticParams` for popular products and plain ISR, given products are
seller-editable at any time and the catalogue size is unknown to me.

Recommend one, say why in 3–4 lines, then implement it. Run `pnpm build` and
report whether the route moved to `○`/`ISR`.

---

## Phase 2 — rendering architecture

This is the phase most likely to break things. Plan before building.

### 4. Plan: `/products` as a server component

**Model:** `claude-opus-5` · **When:** Phase 1 is committed. Plan only.

---

Plan mode, no edits. I want `/products` filtering moved from the `useEffect` +
server-action fetch in `src/components/All/Products/ProductsClient.jsx` to a
server component that reads `searchParams`, keeping only the filter controls
client-side.

Give me: the files you'd change, how filter state maps to URL params, what
happens to pagination and to the loading skeleton, and the two or three things
most likely to regress. No code yet.

---

### 5. Build: `/products` server component

**Model:** `claude-sonnet-5-5` (or `claude-opus-5` if the plan flagged real
risk) · **When:** fresh session after approving prompt 4's plan.

---

Implement the `/products` server-component conversion we planned: server
component reads `searchParams` and fetches, filter controls stay client-side
and push to the URL. Keep the visible UI identical.

Run `pnpm build`, then `pnpm dev` and check `/products` renders products in the
initial HTML (no empty skeleton). Report the route-table line for `/products`
and anything you had to change outside the plan.

---

### 6. Server-side role guards

**Model:** `claude-opus-5` · **When:** after prompt 5. Touches auth — worth the
stronger model.

---

Move the dashboard role checks server-side into the dashboard layouts, and
remove the client-side wait in `src/components/All/auth/RoleGuard.jsx` where the
layout now covers it.

Auth is in scope, so before editing: list every place a session is currently
checked (`src/proxy.js`, `RoleGuard`, individual dashboard pages) and tell me
which checks you're keeping and which you're deleting. Wait for my OK on that
list, then implement. No role should become reachable that wasn't before.

---

### 7. Dashboard pages → server fetch

**Model:** `claude-sonnet-5-5` · **When:** after prompt 6. Split across two or
three sessions — do not try all 13 pages at once.

---

Convert these dashboard pages from `useEffect` + server-action fetch to
server-side fetch + props, keeping server actions for mutations only:
<paste 4–5 page paths>

Add a `loading.jsx` per route so they stream. Keep each page's UI identical.
Run `pnpm build` and list the route-table lines for the converted routes.
Stop after these pages — I'll send the next batch separately.

---

## Phase 3 — JS bundle

### 8a. Measure first

**Model:** `claude-haiku-4-5-20251001` · **When:** start of Phase 3.

---

Run `pnpm build` and give me a table of the 10 largest route JS payloads plus
the shared First Load JS number. No changes, no recommendations — just the
numbers, so I can diff them after Phase 3.

---

### 8b. `recharts` via `next/dynamic`

**Model:** `claude-haiku-4-5-20251001` · **When:** right after 8a. Mechanical.

---

Load `recharts` through `next/dynamic` with `ssr: false` in every dashboard
chart page that imports it directly. Add a small fixed-height placeholder so
the layout doesn't shift. Don't change chart config or data. Run `pnpm build`
and report the before/after JS size for the affected routes.

---

### 8c. `LazyMotion` migration

**Model:** `claude-opus-5` for the first file, then `claude-sonnet-5-5` for the
rest · **When:** after 8b. ~45 files, so do one exemplar then batch.

---

`motion/react` is imported in full in ~45 files, mostly for entrance
animations. Convert **one** home-page section to `LazyMotion` + `m` as a
reference implementation, show me the diff, and tell me the pattern you'd
repeat. Don't touch the other files yet.

---

Then, in a new session:

---

Apply the `LazyMotion` + `m` pattern from commit <sha> to these files:
<paste 8–10 paths>. Same pattern, no other changes. Run `pnpm build` and report
the shared First Load JS delta. Stop after these files.

---

### 8d. Headless UI audit

**Model:** `claude-opus-5` · **When:** optional, last in Phase 3. Read-only.

---

Read-only audit. Three headless UI libraries are installed: `radix-ui`,
`@base-ui/react`, `react-aria-components`. Tell me which components come from
each, how many files use each, and whether one can be dropped — with a rough
estimate of the migration cost. Recommend keep-all or consolidate. No edits.

---

## Phase 4 — images & paint

### 9a. Image config + props

**Model:** `claude-haiku-4-5-20251001` · **When:** any time; independent of the
other phases.

---

Three mechanical changes:

1. Remove the `hostname: "**"` wildcard remote pattern from `next.config.mjs`,
   keeping the specific entries. Tell me if any image in the app would break.
2. Remove `unoptimized` from the profile and checkout images.
3. Add `priority` and a correct `sizes` to the home page's LCP image.

Run `pnpm build`, then `pnpm dev` and confirm the home page and profile images
still load. Short summary.

---

### 9b. Blur reduction

**Model:** `claude-sonnet-5-5` · **When:** last. Visual, so expect to iterate.

---

There are ~67 uses of `filter: blur(...)` / `backdrop-blur` in animations. Find
the ones on large surfaces or in entrance animations and replace them with
opacity/transform equivalents. Leave small static decorative blurs alone.

List what you'd change grouped by file with a one-line reason each, and wait
for my OK before editing — this is a visual change and I want to pick.

---

## Housekeeping

### 10. Close a phase

**Model:** `claude-haiku-4-5-20251001` · **When:** after each phase's PR merges.

---

Update CLAUDE.md: mark Phase <n> done with the commit sha, delete the baseline
findings that no longer apply, and move anything unfinished into the next
phase's "still open" list. Keep it short — this file is read every session.
Don't change anything else in the repo.

---
