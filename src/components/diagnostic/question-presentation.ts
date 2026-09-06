import type { Question } from "../../lib/diagnostic";

export type QuestionVisualStyle = "likert" | "cards" | "open-text";

/**
 * Derived purely from Phase 1's own `type`/`scored` fields (decision #7
 * in the plan) — not a hand-picked per-question-id list. Every scored
 * single-select question (Q4-Q15) is a degree/frequency scale and gets
 * the Likert dot-scale; everything else uses full-width choice cards or
 * the open-text field.
 */
export function getVisualStyle(question: Question): QuestionVisualStyle {
  if (question.type === "textarea") return "open-text";
  if (question.type === "single" && question.scored) return "likert";
  return "cards";
}
