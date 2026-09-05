import { isUncertaintyOption } from "../config/questions";
import type { DiagnosticInput } from "../types";

const SCORED_QUESTION_IDS = [
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
  "q11",
  "q12",
  "q13",
  "q14",
  "q15",
] as const;

export type UncertaintyResult = {
  uncertainAnswers: number;
  uncertaintyRate: number;
  uncertaintyFlag: boolean;
};

/**
 * Counts answers among Q4–Q15 whose chosen option is explicitly configured
 * `uncertainty: true` — never inferred from `score === 1` (spec §19).
 * uncertaintyFlag is display-only: it never modifies IPRS or level.
 */
export function calculateUncertainty(input: DiagnosticInput): UncertaintyResult {
  const uncertainAnswers = SCORED_QUESTION_IDS.reduce((count, questionId) => {
    const answer = input[questionId];
    return count + (isUncertaintyOption(questionId, answer.optionId) ? 1 : 0);
  }, 0);

  const uncertaintyRate = uncertainAnswers / SCORED_QUESTION_IDS.length;

  return {
    uncertainAnswers,
    uncertaintyRate,
    uncertaintyFlag: uncertaintyRate >= 0.25,
  };
}
