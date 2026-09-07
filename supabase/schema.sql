-- IPRS diagnostic submissions.
--
-- Run this once in Supabase's SQL Editor when setting up the project
-- (see README.md's "Persistence setup" section). Not applied automatically
-- by any build step.
--
-- RLS is enabled with zero policies: the anon/public API key gets no
-- access at all. Only the service-role key (used server-side, inside
-- src/pages/api/submit-diagnostic.ts) can read or write this table.

create extension if not exists pgcrypto;

create table public.diagnostic_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  methodology_version text not null,

  -- lead (spec §37/§43)
  lead_first_name text not null,
  lead_last_name text not null,
  lead_email text not null,
  lead_company text not null,
  lead_job_title text not null,
  lead_company_size text not null,
  lead_industry text not null,
  lead_phone text,

  -- raw answers — the source of truth; the server re-derives everything
  -- below from this, never from client-sent scores (spec §53/§55)
  answers jsonb not null,

  -- server-recomputed result (spec §44's `result` shape)
  iprs numeric not null,
  display_iprs integer not null,
  calculated_level text not null,
  final_level text not null,
  critical_gap boolean not null,
  critical_gap_dimensions text[] not null default '{}',
  uncertainty_flag boolean not null,
  dimensions jsonb not null,
  strengths jsonb not null,
  gaps jsonb not null,
  gaps_scenario text not null,
  recommendations jsonb not null,
  cta jsonb not null,

  -- attribution (spec §44)
  source text,
  landing_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text
);

create index diagnostic_submissions_created_at_idx on public.diagnostic_submissions (created_at desc);
create index diagnostic_submissions_email_idx on public.diagnostic_submissions (lead_email);

alter table public.diagnostic_submissions enable row level security;
-- No policies added: the anon/public key gets zero access by default.
-- Only the service-role key (used server-side, in the API route only)
-- can read or write this table.
