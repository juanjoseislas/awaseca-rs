import type { DimensionId, DimensionResults } from "../types";

export type CriticalGapResult = {
  criticalGap: boolean;
  criticalGapDimensions: DimensionId[];
};

/**
 * D2/D3 critical-gap detection (score < 40), independent of the IPRS >= 50
 * gate used by the level cap (spec §15) — the CTA modifiers (spec §34)
 * check D2/D3 < 40 unconditionally, so this single source of truth feeds
 * both consumers without duplicating the threshold check.
 */
export function calculateCriticalGaps(dimensions: DimensionResults): CriticalGapResult {
  const criticalGapDimensions: DimensionId[] = [];
  if (dimensions.D2.score < 40) criticalGapDimensions.push("D2");
  if (dimensions.D3.score < 40) criticalGapDimensions.push("D3");

  return {
    criticalGap: criticalGapDimensions.length > 0,
    criticalGapDimensions,
  };
}
