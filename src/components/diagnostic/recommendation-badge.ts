import { RECOMMENDATION_RULES } from "../../lib/diagnostic/config/recommendations";

const PRIORITY_BY_ID: Record<string, number> = Object.fromEntries(
  RECOMMENDATION_RULES.map((rule) => [rule.id, rule.priority]),
);

/**
 * Derives the "impact" badge shown on each recommendation card from its
 * rule's existing priority value in config/recommendations.ts (decision
 * #4 in the plan) — a UI-layer derivation, not a methodology change.
 * `Recommendation` (the engine's public output type) doesn't carry
 * priority, so it's looked up by id from the same rule catalog.
 */
export function getRecommendationBadge(
  recommendationId: string,
): "Crítico" | "Alto impacto" | "Fundacional" {
  const priority = PRIORITY_BY_ID[recommendationId] ?? 0;
  if (priority >= 100) return "Crítico";
  if (priority >= 90) return "Alto impacto";
  return "Fundacional";
}
