import { CTA_GAP_OVERRIDES, CTA_MODIFIERS, CTA_ROUTES, LEVEL_TONE, Q2_CTA_EMPHASIS } from "../config/ctas";
import type { CTARoute, CTAResult, DiagnosticInput, DimensionResults, Level } from "../types";
import { mergeQ1Objectives } from "./merge-q1-objectives";

export type GenerateCTAContext = {
  answers: DiagnosticInput;
  dimensions: DimensionResults;
  finalLevel: Level;
  hasGaps: boolean;
};

/**
 * Base route from Q3, with the one semantic-feasibility override the spec
 * currently defines: q3_review + q4_first ("this would be our first
 * report") redirects to diagnostic-review, since there's no existing
 * report to review yet (spec §28 validation, §29–33 routes).
 */
function resolveBaseRoute(answers: DiagnosticInput): CTARoute {
  const { q3, q4 } = answers;

  if (q3.optionId === "q3_training") return "training";
  if (q3.optionId === "q3_consulting") return "consulting";
  if (q3.optionId === "q3_specialist") return "specialist";
  if (q3.optionId === "q3_unsure") return "diagnostic-review";

  if (q3.optionId === "q3_review") {
    return q4.optionId === "q4_first" ? "diagnostic-review" : "review";
  }

  return "diagnostic-review";
}

/** D2/D3 critical-gap modifier — combined message wins when both are <40 (spec §34). */
function resolveModifier(dimensions: DimensionResults): string | null {
  const d2Critical = dimensions.D2.score < 40;
  const d3Critical = dimensions.D3.score < 40;

  if (d2Critical && d3Critical) return CTA_MODIFIERS.both;
  if (d2Critical) return CTA_MODIFIERS.d2Only;
  if (d3Critical) return CTA_MODIFIERS.d3Only;
  return null;
}

/**
 * Builds the personalized CTA. Priority order Q3 > Q2 > Q1 > gaps > level
 * (spec §28): Q3 sets the base route (after semantic validation), Q2 adds
 * at most one obstacle emphasis, Q1's merged objectives add a brief
 * purpose phrase, D2/D3 add at most one modifier, and finalLevel only
 * adjusts tone — none of these ever change the route, IPRS, dimensions,
 * or level. `hasGaps` only swaps in the "sin brechas" title/body variant
 * for the current route (approved adjustments doc §3/§4/§5/§7/§8,
 * 2026-09-07) — it never changes the route itself.
 */
export function generateCTA(context: GenerateCTAContext): CTAResult {
  const { answers, dimensions, finalLevel, hasGaps } = context;
  const route = resolveBaseRoute(answers);
  const base = hasGaps ? CTA_ROUTES[route] : { ...CTA_ROUTES[route], ...CTA_GAP_OVERRIDES[route] };

  const emphasis = Q2_CTA_EMPHASIS[answers.q2.optionId];
  const objectives = mergeQ1Objectives(answers.q1);
  const modifier = resolveModifier(dimensions);
  const tone = LEVEL_TONE[finalLevel];

  const bodyParts = [base.body];
  if (emphasis) bodyParts.push(`Un énfasis particular: ${emphasis}.`);
  if (objectives.length > 0) bodyParts.push(`Enfocado en: ${objectives.join(", ")}.`);
  bodyParts.push(`Próximo paso sugerido: ${tone}.`);

  return {
    route,
    title: base.title,
    body: bodyParts.join(" "),
    modifier,
    buttonLabel: base.buttonLabel,
  };
}
