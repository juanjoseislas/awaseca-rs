import { WHY_LEVEL_COPY } from "../config/levels";
import type { DimensionId, Level } from "../types";

/**
 * "¿Por qué este nivel?" explanation, shown only when a level cap actually
 * changed the result (approved adjustments doc §1, 2026-09-07). Returns
 * null when calculatedLevel === finalLevel, so the caller can render
 * nothing rather than an empty section.
 */
export function resolveWhyThisLevel(
  calculatedLevel: Level,
  finalLevel: Level,
  criticalGapDimensions: DimensionId[],
): string | null {
  if (calculatedLevel === finalLevel) return null;

  const d2Critical = criticalGapDimensions.includes("D2");
  const d3Critical = criticalGapDimensions.includes("D3");

  if (d2Critical && d3Critical) return WHY_LEVEL_COPY.bothCritical;
  if (d2Critical) return WHY_LEVEL_COPY.d2Critical;
  if (d3Critical) return WHY_LEVEL_COPY.d3Critical;

  if (calculatedLevel === "Avanzada" && finalLevel === "Preparada") {
    return WHY_LEVEL_COPY.avanzadaToPreparada;
  }

  return null;
}
