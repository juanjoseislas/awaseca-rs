import type { APIRoute } from "astro";
import { env as cloudflareEnv } from "cloudflare:workers";
import { createClient } from "@supabase/supabase-js";
import type { DiagnosticInput } from "../../lib/diagnostic";
import { calculateDiagnostic, DiagnosticValidationError } from "../../lib/diagnostic";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import { validateLeadForm } from "../../components/diagnostic/validation";

export const prerender = false;

type Attribution = Partial<{
  source: string;
  landingPage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
}>;

type SubmitDiagnosticBody = {
  lead?: LeadFormValues;
  answers?: DiagnosticInput;
  attribution?: Attribution;
};

type CloudflareEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Saves a diagnostic submission. The client's own already-computed result
 * keeps rendering immediately on the frontend — this route independently
 * re-validates `answers` and recomputes the result from scratch via the
 * same pure engine Phase 1 built, so what gets persisted is never trusting
 * client-submitted scores (spec §53/§55). Only `lead` + `answers` (raw
 * option ids) + optional attribution are accepted; any `result` a caller
 * might send is ignored.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: SubmitDiagnosticBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const { lead, answers, attribution } = body ?? {};
  if (!lead || !answers) {
    return jsonResponse(400, { ok: false, error: "missing_fields" });
  }

  const leadErrors = validateLeadForm(lead);
  if (Object.keys(leadErrors).length > 0) {
    return jsonResponse(400, { ok: false, error: "invalid_lead", fields: leadErrors });
  }

  let result;
  try {
    result = calculateDiagnostic(answers);
  } catch (error) {
    if (error instanceof DiagnosticValidationError) {
      return jsonResponse(422, { ok: false, error: "invalid_answers" });
    }
    console.error("[api/submit-diagnostic] unexpected engine error", error);
    return jsonResponse(500, { ok: false, error: "calculation_failed" });
  }

  const env = cloudflareEnv as unknown as CloudflareEnv;
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SECRET_KEY) {
    console.error("[api/submit-diagnostic] missing SUPABASE_URL/SUPABASE_SECRET_KEY env vars");
    return jsonResponse(500, { ok: false, error: "storage_not_configured" });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("diagnostic_submissions").insert({
    methodology_version: result.methodologyVersion,

    lead_first_name: lead.firstName,
    lead_last_name: lead.lastName,
    lead_email: lead.email,
    lead_company: lead.company,
    lead_job_title: lead.jobTitle,
    lead_company_size: lead.companySize,
    lead_industry: lead.industry,
    lead_phone: lead.phone || null,

    answers,

    iprs: result.iprs,
    display_iprs: result.displayIprs,
    calculated_level: result.calculatedLevel,
    final_level: result.finalLevel,
    critical_gap: result.criticalGap,
    critical_gap_dimensions: result.criticalGapDimensions,
    uncertainty_flag: result.uncertaintyFlag,
    dimensions: result.dimensions,
    strengths: result.strengths,
    gaps: result.gaps,
    gaps_scenario: result.gapsScenario,
    recommendations: result.recommendations,
    cta: result.cta,

    source: attribution?.source ?? null,
    landing_page: attribution?.landingPage ?? null,
    utm_source: attribution?.utmSource ?? null,
    utm_medium: attribution?.utmMedium ?? null,
    utm_campaign: attribution?.utmCampaign ?? null,
    utm_content: attribution?.utmContent ?? null,
    utm_term: attribution?.utmTerm ?? null,
    referrer: attribution?.referrer ?? null,
  });

  if (error) {
    console.error("[api/submit-diagnostic] supabase insert failed", error);
    return jsonResponse(500, { ok: false, error: "storage_failed" });
  }

  return jsonResponse(200, { ok: true });
};

// Astro dispatches POST requests to the handler above and routes every
// other method here automatically — this only exists to return 405
// instead of Astro's default 404 for a route that does exist.
export const ALL: APIRoute = async () => jsonResponse(405, { ok: false, error: "method_not_allowed" });
