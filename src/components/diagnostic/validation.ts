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
const PHONE_PATTERN = /^[0-9]*$/;

/**
 * Per-field max lengths (best-practice bounds, not part of the closed IPRS
 * spec): name/job/industry/company fields cap at a generous 100 chars,
 * email at RFC 5321's 254-char limit, phone at E.164's 15-digit limit.
 * Enforced here so the server route (which imports this same function)
 * rejects an oversized payload even if the client's `maxLength` is bypassed.
 */
export const FIELD_MAX_LENGTHS: Partial<Record<keyof LeadFormValues, number>> = {
  firstName: 50,
  lastName: 50,
  email: 254,
  company: 100,
  jobTitle: 100,
  industry: 100,
  phone: 15,
};

export function validateLeadForm(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  for (const field of LEAD_CAPTURE_COPY.requiredFields) {
    const key = field as keyof LeadFormValues;
    if (!values[key]?.trim()) {
      errors[key] = VALIDATION_COPY.required;
    }
  }

  if (values.email && !errors.email && !EMAIL_PATTERN.test(values.email)) {
    errors.email = VALIDATION_COPY.invalidEmail;
  }

  if (values.phone && !PHONE_PATTERN.test(values.phone)) {
    errors.phone = VALIDATION_COPY.invalidPhone;
  }

  for (const [field, maxLength] of Object.entries(FIELD_MAX_LENGTHS) as Array<
    [keyof LeadFormValues, number]
  >) {
    const value = values[field];
    if (value && value.length > maxLength && !errors[field]) {
      errors[field] = VALIDATION_COPY.tooLong(maxLength);
    }
  }

  return errors;
}
