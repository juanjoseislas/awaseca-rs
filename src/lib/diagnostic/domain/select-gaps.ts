import { DIMENSION_IDS } from "../config/dimensions";
import type { DimensionResult, DimensionResults, GapItem, GapsScenario } from "../types";

export type GapsSelection = {
  gaps: GapItem[];
  scenario: GapsScenario;
};

/**
 * Priority tier for gap selection (spec §22, rule 4-5): D2/D3 below 40 rank
 * above any other <40 dimension, which ranks above 40-59, which ranks
 * above 60-69. Lower tier number = higher priority.
 */
function gapPriorityTier(dimension: DimensionResult): number {
  const isCriticalBelow40 =
    (dimension.dimensionId === "D2" || dimension.dimensionId === "D3") && dimension.score < 40;
  if (isCriticalBelow40) return 0;
  if (dimension.score < 40) return 1;
  if (dimension.score < 60) return 2;
  return 3;
}

/**
 * Scenario A (at least one dimension < 70): eligible dimensions are those
 * < 70, prioritized per `gapPriorityTier` then ascending score, max 2.
 * Scenario B (all dimensions >= 70): no gaps are labeled — instead the two
 * lowest-scoring dimensions are returned as consolidation opportunities,
 * keeping their real classification (spec §22).
 */
export function selectGaps(dimensions: DimensionResults): GapsSelection {
  const all = DIMENSION_IDS.map((id) => dimensions[id]);
  const eligible = all.filter((dimension) => dimension.score < 70);

  if (eligible.length === 0) {
    const opportunities = [...all]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map((dimension) => ({ ...dimension, isOpportunity: true }));

    return { gaps: opportunities, scenario: "consolidation-opportunities" };
  }

  const gaps = eligible
    .sort((a, b) => {
      const tierDiff = gapPriorityTier(a) - gapPriorityTier(b);
      return tierDiff !== 0 ? tierDiff : a.score - b.score;
    })
    .slice(0, 2)
    .map((dimension) => ({ ...dimension }));

  return { gaps, scenario: "gaps" };
}
