import { DIMENSIONS, DIMENSION_IDS } from "../config/dimensions";
import { getConfiguredScore } from "../config/questions";
import type { DiagnosticInput, DimensionResults } from "../types";
import { classifyDimension } from "./classify-dimension";
import { normalizeDimension } from "./normalize-dimension";

/**
 * Computes all 5 dimension scores from Q4–Q15. Scores are always re-derived
 * from config via each answer's optionId — never trusted from the answer's
 * own `.score` field (spec §53/§55).
 */
export function calculateDimensions(input: DiagnosticInput): DimensionResults {
  const results = {} as DimensionResults;

  for (const dimensionId of DIMENSION_IDS) {
    const definition = DIMENSIONS[dimensionId];
    const obtainedScore = definition.questionIds.reduce((sum, questionId) => {
      const answer = input[questionId as keyof DiagnosticInput] as { optionId: string };
      return sum + getConfiguredScore(questionId, answer.optionId);
    }, 0);

    const score = normalizeDimension(
      obtainedScore,
      definition.minimumScore,
      definition.maximumScore,
    );

    results[dimensionId] = {
      dimensionId,
      name: definition.name,
      score,
      displayScore: Math.floor(score),
      classification: classifyDimension(score),
      critical: definition.critical,
    };
  }

  return results;
}
