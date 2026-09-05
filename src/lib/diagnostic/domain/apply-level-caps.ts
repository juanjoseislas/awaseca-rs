import { DIMENSION_IDS } from "../config/dimensions";
import type { DimensionId, DimensionResults, Level } from "../types";
import { capLevel } from "./calculate-level";

/**
 * Applies both level-cap rules, most restrictive wins (spec §15–17):
 *  - Regla Crítica A: IPRS >= 50 AND (D2 < 40 OR D3 < 40) -> cap at "En desarrollo".
 *  - Regla de Equilibrio: IPRS >= 75 AND min(D1..D5) < 60 -> cap at "Preparada".
 * The IPRS value itself is never modified by these rules.
 */
export function applyLevelCaps(
  calculatedLevel: Level,
  iprs: number,
  dimensions: DimensionResults,
  criticalGapDimensions: DimensionId[],
): Level {
  let level = calculatedLevel;

  if (iprs >= 50 && criticalGapDimensions.length > 0) {
    level = capLevel(level, "En desarrollo");
  }

  const minDimensionScore = Math.min(...DIMENSION_IDS.map((id) => dimensions[id].score));
  if (iprs >= 75 && minDimensionScore < 60) {
    level = capLevel(level, "Preparada");
  }

  return level;
}
