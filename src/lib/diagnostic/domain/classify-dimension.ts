import type { DimensionClassification } from "../types";

/** 5-tier dimension classification by normalized score (spec §18). */
export function classifyDimension(score: number): DimensionClassification {
  if (score < 40) return "Brecha crítica";
  if (score < 60) return "Brecha prioritaria";
  if (score < 70) return "Área por fortalecer";
  if (score < 80) return "Funcional";
  return "Fortaleza consolidada";
}
