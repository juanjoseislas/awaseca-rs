import type { DiagnosticInput, DiagnosticResult } from "./diagnostic";

/**
 * This file — not src/lib/diagnostic/ — owns anything with side effects
 * (storage, eventually network), keeping the engine's "pure, no side
 * effects" invariant intact. Phase 3 replaces this function's body with a
 * real Supabase call; the signature is designed to stay stable across that
 * swap.
 */

export type LeadFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  companySize: string;
  industry: string;
  phone?: string;
};

export type DiagnosticSubmissionPayload = {
  lead: LeadFormValues;
  answers: DiagnosticInput;
  result: DiagnosticResult;
  submittedAt: string;
};

export type DiagnosticSubmissionOutcome = { ok: true } | { ok: false; error: string };

const SUBMISSIONS_STORAGE_KEY = "awaseca.diagnostic.submissions.v1";
const MAX_STORED_SUBMISSIONS = 5;

/**
 * Stub persistence: today this only writes to localStorage + console for
 * manual QA. Never throws — a stub-persistence failure must never block a
 * user from seeing the free diagnostic they just completed.
 */
export async function saveDiagnosticSubmission(
  payload: DiagnosticSubmissionPayload,
): Promise<DiagnosticSubmissionOutcome> {
  try {
    const existingRaw = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const existing: DiagnosticSubmissionPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
    const next = [...existing, payload].slice(-MAX_STORED_SUBMISSIONS);
    window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("[diagnostic] could not persist submission stub to localStorage", error);
  }

  console.info("[diagnostic] submission (stub)", payload);

  return { ok: true };
}
