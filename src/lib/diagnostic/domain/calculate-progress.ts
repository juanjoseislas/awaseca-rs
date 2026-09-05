/**
 * Progress considers only Q1–Q15 — Q16/Q17 never increase or decrease it
 * and never change the denominator (spec §35).
 */
export function calculateProgress(completedMainQuestions: number): number {
  return (completedMainQuestions / 15) * 100;
}
