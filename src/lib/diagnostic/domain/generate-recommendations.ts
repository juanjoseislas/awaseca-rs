import { RECOMMENDATION_RULES } from "../config/recommendations";
import type { Recommendation, RecommendationContext } from "../types";

/**
 * Evaluates the rule catalog, keeps only matching rules, sorts by priority
 * descending, dedupes semantically redundant rules (only the
 * highest-priority match per `deduplicationGroup` survives), and returns
 * at most 3 (spec §23–26).
 */
export function generateRecommendations(context: RecommendationContext): Recommendation[] {
  const matches = RECOMMENDATION_RULES.filter((rule) => rule.condition(context)).sort(
    (a, b) => b.priority - a.priority,
  );

  const seenGroups = new Set<string>();
  const deduped: Recommendation[] = [];

  for (const rule of matches) {
    if (rule.deduplicationGroup) {
      if (seenGroups.has(rule.deduplicationGroup)) continue;
      seenGroups.add(rule.deduplicationGroup);
    }
    deduped.push({
      id: rule.id,
      category: rule.category,
      title: rule.title,
      description: rule.description,
    });
    if (deduped.length === 3) break;
  }

  return deduped;
}
