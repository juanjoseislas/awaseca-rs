import { QUESTIONS_BY_ID } from "./config/questions";
import type { Answer, DiagnosticInput } from "./types";

function answerFor(questionId: string, optionId: string): Answer {
  const question = QUESTIONS_BY_ID[questionId];
  const option = question?.options?.find((candidate) => candidate.id === optionId);
  if (!option) {
    throw new Error(`fixture: no option "${optionId}" for question "${questionId}"`);
  }
  return { questionId, optionId, label: option.label, score: option.score };
}

/** All-score-1 (tier 1) options for Q4–Q15 — the minimum-possible fixture. */
export const TIER1_OPTIONS: Record<string, string> = {
  q4: "q4_first",
  q5: "q5_no",
  q6: "q6_no",
  q7: "q7_no",
  q8: "q8_no",
  q9: "q9_no",
  q10: "q10_no",
  q11: "q11_no",
  q12: "q12_no_report",
  q13: "q13_unknown",
  q14: "q14_no_report",
  q15: "q15_no_report",
};

/** All-score-2 (tier 2) options for Q4–Q15. */
export const TIER2_OPTIONS: Record<string, string> = {
  q4: "q4_once_twice",
  q5: "q5_unsystematic",
  q6: "q6_some",
  q7: "q7_partial",
  q8: "q8_updating",
  q9: "q9_partial",
  q10: "q10_partial",
  q11: "q11_some",
  q12: "q12_other",
  q13: "q13_basic",
  q14: "q14_no_tracking",
  q15: "q15_evaluating",
};

/** All-score-3 (tier 3) options for Q4–Q15. */
export const TIER3_OPTIONS: Record<string, string> = {
  q4: "q4_irregular",
  q5: "q5_partial_high",
  q6: "q6_main_topics",
  q7: "q7_identified",
  q8: "q8_updated",
  q9: "q9_recent",
  q10: "q10_informal",
  q11: "q11_majority",
  q12: "q12_partial",
  q13: "q13_evaluated",
  q14: "q14_some",
  q15: "q15_some",
};

/** All-score-4 (tier 4) options for Q4–Q15 — the maximum-possible fixture. */
export const TIER4_OPTIONS: Record<string, string> = {
  q4: "q4_regular",
  q5: "q5_documented",
  q6: "q6_tracking",
  q7: "q7_prioritized",
  q8: "q8_integrated",
  q9: "q9_historical",
  q10: "q10_formal",
  q11: "q11_systematic",
  q12: "q12_structured",
  q13: "q13_advancing",
  q14: "q14_systematic",
  q15: "q15_regular",
};

export type BuildInputOptions = {
  q1?: string[];
  q2?: string;
  q3?: string;
  q16?: string;
  q17?: string;
};

/**
 * Builds a full DiagnosticInput from Q4–Q15 option-id overrides on top of
 * the tier-1 (all minimum) baseline, plus optional Q1/Q2/Q3/Q16/Q17
 * overrides. Every Answer is built from config so label/score always
 * match what `calculateDiagnostic` will itself re-derive.
 */
export function buildInput(
  overrides: Partial<Record<string, string>> = {},
  options: BuildInputOptions = {},
): DiagnosticInput {
  const merged: Record<string, string> = { ...TIER1_OPTIONS, ...overrides } as Record<
    string,
    string
  >;
  const q1Ids = options.q1 ?? ["q1_regulatory"];

  return {
    q1: q1Ids.map((id) => answerFor("q1", id)),
    q2: answerFor("q2", options.q2 ?? "q2_knowledge"),
    q3: answerFor("q3", options.q3 ?? "q3_training"),
    q4: answerFor("q4", merged.q4),
    q5: answerFor("q5", merged.q5),
    q6: answerFor("q6", merged.q6),
    q7: answerFor("q7", merged.q7),
    q8: answerFor("q8", merged.q8),
    q9: answerFor("q9", merged.q9),
    q10: answerFor("q10", merged.q10),
    q11: answerFor("q11", merged.q11),
    q12: answerFor("q12", merged.q12),
    q13: answerFor("q13", merged.q13),
    q14: answerFor("q14", merged.q14),
    q15: answerFor("q15", merged.q15),
    q16: options.q16 ? answerFor("q16", options.q16) : undefined,
    q17: options.q17,
  };
}
