import { DIMENSION_IDS } from "../config/dimensions";
import type { DimensionResults, StrengthItem } from "../types";

/**
 * Only dimensions with score >= 70 are eligible, sorted descending, max 2,
 * never fabricated to fill two slots (spec §21). Dimensions in
 * 60 <= score < 70 ("Área por fortalecer") must never appear here.
 */
export function selectStrengths(dimensions: DimensionResults): StrengthItem[] {
  return DIMENSION_IDS.map((id) => dimensions[id])
    .filter((dimension) => dimension.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ dimensionId, name, score, displayScore, classification }) => ({
      dimensionId,
      name,
      score,
      displayScore,
      classification,
    }));
}
