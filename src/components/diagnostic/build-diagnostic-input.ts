import type { DiagnosticInput } from "../../lib/diagnostic";

const REQUIRED_SINGLE_ANSWER_IDS = [
  "q2",
  "q3",
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

/**
 * Asserts the wizard's in-progress `Partial<DiagnosticInput>` is complete
 * enough to hand to `calculateDiagnostic`. Only called once, at the
 * Q17 -> lead-capture transition, after every required screen has already
 * passed per-question validation — this is a defensive completeness
 * check, not a substitute for that validation.
 */
export function buildDiagnosticInput(answers: Partial<DiagnosticInput>): DiagnosticInput {
  if (!answers.q1 || answers.q1.length < 1 || answers.q1.length > 2) {
    throw new Error("buildDiagnosticInput: q1 must have 1-2 answers");
  }

  for (const id of REQUIRED_SINGLE_ANSWER_IDS) {
    if (!answers[id]) {
      throw new Error(`buildDiagnosticInput: missing answer for "${id}"`);
    }
  }

  return answers as DiagnosticInput;
}
