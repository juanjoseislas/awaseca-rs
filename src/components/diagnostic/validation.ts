import type { Answer, Question } from "../../lib/diagnostic";
import { LEAD_CAPTURE_COPY } from "../../lib/diagnostic";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import { VALIDATION_COPY } from "./copy";
import type { LeadFormErrors } from "./types";

export type ValidationResult = { valid: boolean; message?: string };

/**
 * One generic validator reading each question's own type/required/
 * maxSelections — no per-question-id special-casing (spec's engine
 * separation principle applies to the UI layer too).
 */
export function validateAnswerForQuestion(
  question: Question,
  currentAnswer: Answer[] | Answer | undefined,
): ValidationResult {
  if (question.type === "multiple") {
    const count = Array.isArray(currentAnswer) ? currentAnswer.length : 0;
    if (question.required && count < 1) {
      return { valid: false, message: VALIDATION_COPY.selectAtLeastOne };
    }
    if (question.maxSelections && count > question.maxSelections) {
      return { valid: false, message: VALIDATION_COPY.selectAtMost(question.maxSelections) };
    }
    return { valid: true };
  }

  if (question.type === "single") {
    if (question.required && !currentAnswer) {
      return { valid: false, message: VALIDATION_COPY.selectOne };
    }
    return { valid: true };
  }

  return { valid: true }; // textarea (Q17) is always valid, optional
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadForm(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  for (const field of LEAD_CAPTURE_COPY.requiredFields) {
    const key = field as keyof LeadFormValues;
    if (!values[key]?.trim()) {
      errors[key] = VALIDATION_COPY.required;
    }
  }

  if (values.email && !EMAIL_PATTERN.test(values.email)) {
    errors.email = VALIDATION_COPY.invalidEmail;
  }

  return errors;
}
