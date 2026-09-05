import { DIAGNOSTIC_VERSION } from "../constants";
import type { DiagnosticInput, DiagnosticResult } from "../types";
import { applyLevelCaps } from "./apply-level-caps";
import { calculateCriticalGaps } from "./calculate-critical-gaps";
import { calculateDimensions } from "./calculate-dimensions";
import { calculateIPRS } from "./calculate-iprs";
import { getCalculatedLevel } from "./calculate-level";
import { calculateUncertainty } from "./calculate-uncertainty";
import { generateCTA } from "./generate-cta";
import { generateRecommendations } from "./generate-recommendations";
import { selectGaps } from "./select-gaps";
import { selectStrengths } from "./select-strengths";
import { validateDiagnosticInput } from "./validate-input";

/**
 * Pure top-level orchestrator (spec §10): same input always produces the
 * same output, no network/DB access, no side effects, no UI dependency.
 * Wires together validation -> dimensions -> IPRS -> level -> caps ->
 * uncertainty -> strengths -> gaps -> recommendations -> CTA, per the
 * processing sequence in spec §38 (steps 3-12; lead capture and
 * persistence, steps 1-2 and 13-19, belong to a future UI/backend phase).
 */
export function calculateDiagnostic(input: DiagnosticInput): DiagnosticResult {
  validateDiagnosticInput(input);

  const dimensions = calculateDimensions(input);
  const iprs = calculateIPRS(dimensions);
  const calculatedLevel = getCalculatedLevel(iprs);
  const { criticalGap, criticalGapDimensions } = calculateCriticalGaps(dimensions);
  const finalLevel = applyLevelCaps(calculatedLevel, iprs, dimensions, criticalGapDimensions);
  const uncertainty = calculateUncertainty(input);
  const strengths = selectStrengths(dimensions);
  const { gaps, scenario: gapsScenario } = selectGaps(dimensions);
  const recommendations = generateRecommendations({ answers: input, dimensions });
  const cta = generateCTA({ answers: input, dimensions, finalLevel });

  return {
    methodologyVersion: DIAGNOSTIC_VERSION,
    iprs,
    displayIprs: Math.floor(iprs),
    calculatedLevel,
    finalLevel,
    criticalGap,
    criticalGapDimensions,
    uncertainAnswers: uncertainty.uncertainAnswers,
    uncertaintyRate: uncertainty.uncertaintyRate,
    uncertaintyFlag: uncertainty.uncertaintyFlag,
    dimensions,
    strengths,
    gaps,
    gapsScenario,
    recommendations,
    cta,
  };
}
