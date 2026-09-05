import { QUESTIONS_BY_ID } from "../config/questions";
import type { Answer, DiagnosticInput } from "../types";

export class DiagnosticValidationError extends Error {}

const SINGLE_ANSWER_QUESTION_IDS = [
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

function assertValidOption(questionId: string, answer: Answer): void {
  const question = QUESTIONS_BY_ID[questionId];
  if (!question) {
    throw new DiagnosticValidationError(`Unknown question "${questionId}"`);
  }
  const optionExists = question.options?.some((option) => option.id === answer.optionId);
  if (!optionExists) {
    throw new DiagnosticValidationError(
      `Invalid option "${answer.optionId}" for question "${questionId}"`,
    );
  }
}

/**
 * Integrity guards from spec §55: Q4–Q15 must exist, option IDs must be
 * valid against config, and Q1 must have between 1 and 2 selections.
 * Scores themselves are never taken from the input — they're re-derived
 * from config wherever they're used (see getConfiguredScore).
 */
export function validateDiagnosticInput(input: DiagnosticInput): void {
  if (!Array.isArray(input.q1) || input.q1.length < 1 || input.q1.length > 2) {
    throw new DiagnosticValidationError("q1 must have between 1 and 2 selected options");
  }
  for (const answer of input.q1) {
    assertValidOption("q1", answer);
  }

  for (const questionId of SINGLE_ANSWER_QUESTION_IDS) {
    const answer = input[questionId];
    if (!answer) {
      throw new DiagnosticValidationError(`Missing required answer for "${questionId}"`);
    }
    assertValidOption(questionId, answer);
  }

  if (input.q16) {
    assertValidOption("q16", input.q16);
  }
}
