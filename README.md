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

## Design tokens

Never hardcode hex values — reference a named token. Tokens live in
`src/styles/theme.css` (Tailwind v4's `@theme` block).

## Documentation

- [Astro docs](https://docs.astro.build)
- [Astro + Cloudflare adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Supabase JS client](https://supabase.com/docs/reference/javascript/introduction)
