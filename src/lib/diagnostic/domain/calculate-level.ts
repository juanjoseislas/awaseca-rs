import { LEVEL_ORDER, LEVEL_THRESHOLDS } from "../config/levels";
import type { Level } from "../types";

/**
 * 4-tier level from the internal decimal IPRS using continuous intervals
 * (spec §14). Always call this with the full decimal IPRS, never the
 * floored display value — flooring is presentation-only and must never
 * cross a level threshold the decimal hasn't actually crossed.
 */
export function getCalculatedLevel(iprs: number): Level {
  if (iprs < LEVEL_THRESHOLDS.enDesarrollo) return "Inicial";
  if (iprs < LEVEL_THRESHOLDS.preparada) return "En desarrollo";
  if (iprs < LEVEL_THRESHOLDS.avanzada) return "Preparada";
  return "Avanzada";
}

/**
 * A cap can only maintain or lower a level, never raise it (spec §17).
 * Returns whichever of the two levels is lower in the hierarchy.
 */
export function capLevel(currentLevel: Level, maximumAllowedLevel: Level): Level {
  return LEVEL_ORDER[currentLevel] <= LEVEL_ORDER[maximumAllowedLevel]
    ? currentLevel
    : maximumAllowedLevel;
}
