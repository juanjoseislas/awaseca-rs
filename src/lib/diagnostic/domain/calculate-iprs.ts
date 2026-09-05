import { DIMENSIONS, DIMENSION_IDS } from "../config/dimensions";
import type { DimensionResults } from "../types";

/**
 * Weighted sum of the 5 dimensions (spec §13). Returns the full decimal
 * value — never round here, `displayIprs = Math.floor(iprs)` is a
 * presentation-only concern applied separately.
 */
export function calculateIPRS(dimensions: DimensionResults): number {
  return DIMENSION_IDS.reduce(
    (sum, dimensionId) => sum + dimensions[dimensionId].score * DIMENSIONS[dimensionId].weight,
    0,
  );
}
