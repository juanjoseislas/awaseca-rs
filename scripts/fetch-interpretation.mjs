#!/usr/bin/env node
// Pulls one submission's already-generated sales-brief markdown out of
// Supabase and saves it locally — see "Sales-brief notifications" in
// README.md for when/why to run this.
//
// Plain Node (no Vite/Workers runtime involved), so it has real
// filesystem access, unlike the API route — Cloudflare Workers has none,
// in dev or in production, which is why this can't be automatic.
//
// Usage:
//   npm run fetch-interpretation -- <submission-id>
//
// Reads SUPABASE_URL / SUPABASE_SECRET_KEY from .dev.vars (same file the
// app itself uses locally).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function slugifyCompanyName(company) {
  return (
    company
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "empresa"
  );
}

async function loadDevVars() {
  const raw = await readFile(path.join(ROOT, ".dev.vars"), "utf-8").catch(() => null);
  if (raw === null) {
    throw new Error(
      ".dev.vars not found. Copy .dev.vars.example to .dev.vars and fill in your Supabase credentials first.",
    );
  }
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error(".dev.vars is missing SUPABASE_URL and/or SUPABASE_SECRET_KEY.");
  }
  return env;
}

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: npm run fetch-interpretation -- <submission-id>");
    process.exitCode = 1;
    return;
  }

  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = await loadDevVars();

  const url = `${SUPABASE_URL}/rest/v1/diagnostic_submissions?id=eq.${encodeURIComponent(id)}&select=lead_company,interpretation_markdown`;
  const response = await fetch(url, {
    headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: HTTP ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  if (rows.length === 0) {
    console.error(`No submission found with id "${id}".`);
    process.exitCode = 1;
    return;
  }

  const row = rows[0];
  if (!row.interpretation_markdown) {
    console.error(
      `Submission "${id}" has no interpretation_markdown (it predates the sales-brief automation, or generation failed for it).`,
    );
    process.exitCode = 1;
    return;
  }

  const outDir = path.join(ROOT, "Interpretaciones");
  const outFile = path.join(outDir, `${id}-${slugifyCompanyName(row.lead_company)}.md`);
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, row.interpretation_markdown, "utf-8");

  console.log(`Saved: ${path.relative(ROOT, outFile)}`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
