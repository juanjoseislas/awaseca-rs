# Awaseca landing page to generate Leads for sustainanility report

This project will be Awaseca's landing page.

Objective:

Develop a free digital assessment tool that enables a company to determine
its level of readiness or maturity for preparing or strengthening its
Sustainability Report.

The assessment must:

1. Generate an IPRS score ranging from 0 to 100.
2. Classify the user into one of four readiness levels.
3. Identify strengths and gaps.
4. Detect critical gaps related to materiality and data.
5. Generate personalized recommendations.
6. Identify the type of support the company requires.
7. Use the result to generate a dynamic commercial call-to-action (CTA).
8. Request lead details only before revealing the assessment results.

## Stack
Astro + TypeScript + Tailwind v4 (via `@tailwindcss/vite`). Hosted on Cloudflare Pages, deploys from `main`.
Notes/blog content lives in Astro Content Collections (`src/content/notes/{en,es}/`). Supabase for database.

## Design tokens
— never hardcode hex values, always reference a named token and store them in `theme.css` / `theme.ts`

## Workflow
- Default to plan mode for any multi-file or non-trivial change — propose, wait for approval, then implement.
- Bilingual (EN/ES) output expected for all user-facing copy

## Project

Astro site built with the Astro framework. No UI framework (React/Vue/Svelte) is installed — pages are plain `.astro` components. Bilingual (EN/ES) via Astro's built-in i18n routing: `/` serves English (default, no prefix), `/es/` serves Spanish, with independently named route segments per locale 

## Commands

- `npm install` — install dependencies
- `astro dev --background` — start the dev server in the background (see below); site serves at `localhost:4321`
- `astro dev stop` / `astro dev status` / `astro dev logs` — manage the background dev server
- `npm run build` — type-check and build the production site to `./dist/`
- `npm run preview` — preview the production build locally
- `npm run astro check` — run Astro's type checker
- `npm run astro -- --help` — general Astro CLI help

There is no test suite or linter configured in this repository.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Testing Requirements
- No test framework is currently configured in `package.json`.
- For now, validate changes with:
  - `npm run build` (runs `astro check` + build — catches type errors and broken references)
  - `npm run astro check` (type-check only, faster iteration)
  - No linter configured yet — if one is added later, add it here
  - Manual browser smoke testing (desktop + mobile viewport) after any layout, copy, or styling change

  ### Naming Conventions
- **Routes**: file-based via `src/pages/` — `index.astro` → `/`, `about.astro` → `/about`,
  kebab-case for multi-word routes (`case-studies.astro`). Spanish routes live under
  `src/pages/es/` with their own (translated, not mirrored) slugs.
- **Components**: `PascalCase.astro` in `src/components/`.
- **Variables/functions** (in frontmatter or any `.ts` files): `camelCase`.
- **Types**: `PascalCase`.

### Documentation
- Keep setup and commands in `README.md`.
- Record non-obvious decisions (why a page structure or copy choice was made)
  directly in this file or as a comment near the relevant code — no separate
  guidelines folder until the CMS integration adds real complexity worth tracking.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
