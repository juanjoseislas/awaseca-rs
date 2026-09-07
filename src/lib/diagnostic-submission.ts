import type { DiagnosticInput, DiagnosticResult } from "./diagnostic";

/**
 * This file — not src/lib/diagnostic/ — owns anything with side effects
 * (network), keeping the engine's "pure, no side effects" invariant intact.
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
  /**
   * Kept in the payload type so callers (DiagnosticApp) don't need to
   * change — but never sent to the server. The API route recomputes the
   * result itself from `answers` and would ignore a client-sent one
   * anyway (spec §53/§55: never trust client-submitted scores).
   */
  result: DiagnosticResult;
  submittedAt: string;
};

export type DiagnosticSubmissionOutcome = { ok: true } | { ok: false; error: string };

function captureAttribution() {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("source") ?? undefined,
    landingPage: window.location.pathname,
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
    utmTerm: params.get("utm_term") ?? undefined,
    referrer: document.referrer || undefined,
  };
}

/**
 * Saves a diagnostic submission via the server-side API route, which
 * independently re-validates and recomputes the result from `answers`
 * before writing to Supabase. Never throws — a persistence failure must
 * never block a user from seeing the free diagnostic they just completed.
 */
export async function saveDiagnosticSubmission(
  payload: DiagnosticSubmissionPayload,
): Promise<DiagnosticSubmissionOutcome> {
  try {
    const response = await fetch("/api/submit-diagnostic", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lead: payload.lead,
        answers: payload.answers,
        attribution: captureAttribution(),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      console.warn("[diagnostic] submission request failed", response.status, body);
      return { ok: false, error: body?.error ?? `http_${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.warn("[diagnostic] submission request threw", error);
    return { ok: false, error: "network_error" };
  }
}
