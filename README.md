# Awaseca — IPRS Diagnóstico

A free digital assessment tool that helps a company determine its readiness for
preparing or strengthening its Sustainability Report — the **IPRS** (Índice de
Preparación para Reportes de Sostenibilidad). 15 questions, 5 minutes, a
0–100 score, a readiness level, strengths/gaps, and a personalized
recommendation + CTA.

## Stack

Astro + TypeScript + Preact (one island: the quiz/results app) + Tailwind v4.
Deployed on Cloudflare via the `@astrojs/cloudflare` adapter (the site is
mostly static; `src/pages/api/submit-diagnostic.ts` is the one dynamic route).
Supabase stores diagnostic submissions.

## Project structure

```
src/lib/diagnostic/            Phase 1: the pure scoring/recommendation/CTA engine
src/lib/diagnostic-submission.ts  Phase 3: posts a completed diagnostic to the API route
src/lib/diagnostic-progress-storage.ts  localStorage-backed in-progress quiz state
src/components/diagnostic/     Phase 2: the Preact quiz/results UI (one island)
src/pages/index.astro          the static shell hosting the island
src/pages/api/submit-diagnostic.ts  Phase 3: validates + recomputes + saves to Supabase
supabase/schema.sql            the diagnostic_submissions table (see setup below)
```

## Commands

```bash
npm install
astro dev --background   # start the dev server at localhost:4321 (see below)
npm run build             # type-check + build to ./dist/
npm run preview            # preview the production build locally
npm run test                # vitest — engine, UI state, and API route tests
npm run astro check         # type-check only
```

Manage the background dev server with `astro dev stop`, `astro dev status`,
`astro dev logs`.

### Testing

`npm run test` runs the full suite (engine, reducer, localStorage, and the
API route with a mocked Supabase client — no real project needed to run
tests). `npm run astro check` type-checks the whole project. There's no
separate linter configured yet.

## Persistence setup (Supabase)

The diagnostic saves each submission via a server-side API route, which
independently re-validates and recomputes the result from the raw answers
before writing (never trusting a client-submitted score) and inserts one row
into a `diagnostic_submissions` table.

1. Create a free project at [supabase.com](https://supabase.com) (pick a
   region close to the target audience). You'll be asked for a database
   password at creation — generate a strong one and store it safely; this
   project doesn't need it day-to-day (it uses the Data API + the Secret
   API key, not a direct Postgres connection).
2. On the project's security options, enable: **Data API** (required —
   it's what `@supabase/supabase-js` talks to), **Automatically expose new
   tables** (convenience; RLS still gates access regardless), **Automatic
   RLS** (safety net, matches this schema's explicit `enable row level
   security`).
3. Open the SQL Editor and run `supabase/schema.sql`.
4. Project Settings → API Keys: copy the **Project URL** and the **Secret**
   API key (Supabase's current name for what used to be `service_role` —
   same purpose) — not the **Publishable**/`anon` key, since this table
   intentionally has no public access (RLS is on with zero policies; only
   the secret key, used server-side only, can touch it).
5. Add both as environment variables:
   - **Local dev**: copy `.dev.vars.example` to `.dev.vars` (gitignored) and
     fill in the real values.
   - **Production**: Cloudflare Pages dashboard → Settings → Environment
     variables.
6. If the table already existed before the sales-brief automation below
   was added, run the `alter table ... add column if not exists
   interpretation_markdown text;` migration at the bottom of
   `supabase/schema.sql` once.

## Sales-brief notifications

Each submission also generates a markdown sales brief — same sections as a
manually-written one (result, dimensions, recommendations, full Q&A, CTA,
talking points) — via `src/lib/diagnostic/report/build-interpretation-markdown.ts`.
It's saved in the `interpretation_markdown` column of the submission's row,
and the route then emails it to the sales team through
[Resend](https://resend.com) (`src/lib/notify/send-interpretation-email.ts`,
plain `fetch` to its HTTP API — no SDK dependency).

Configure in `.dev.vars` (local) / the Cloudflare Pages dashboard (prod):
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` (must be on a domain verified in your
Resend account), `SALES_NOTIFICATION_EMAIL` (the sales-team recipient). If
either `RESEND_API_KEY` or `SALES_NOTIFICATION_EMAIL` is missing, the
submission still saves and responds normally — only the email is skipped
(logged as an error server-side).

The API route itself never touches the filesystem — Cloudflare Workers has
none, in dev or in production (confirmed: even under `astro dev`, the
`@astrojs/cloudflare` adapter runs requests through a workerd-like sandbox
that throws `EPERM` on any real file write). If you need a local `.md` copy
of a specific submission — e.g. to open it in-editor before a sales call
without digging through email or Supabase — run, from the repo root with
`.dev.vars` filled in:

```bash
npm run fetch-interpretation -- <submission-id>
```

This pulls that row's `interpretation_markdown` from Supabase via plain
Node (`scripts/fetch-interpretation.mjs` — outside the Workers/Vite runtime,
so it has real `fs` access) and saves it to the gitignored
`Interpretaciones/<id>-<company-slug>.md`. It's a manual, on-demand dev
convenience, not something the sales team runs — they already get the
brief automatically by email on every submission.

## Design tokens

Never hardcode hex values — reference a named token. Tokens live in
`src/styles/theme.css` (Tailwind v4's `@theme` block).

## Documentation

- [Astro docs](https://docs.astro.build)
- [Astro + Cloudflare adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Supabase JS client](https://supabase.com/docs/reference/javascript/introduction)
