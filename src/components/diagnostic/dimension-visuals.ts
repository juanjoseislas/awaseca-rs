import type { DimensionClassification } from "../../lib/diagnostic";

export type DimensionVisual = {
  barColorClass: string;
  pillLabel: "Fortaleza" | "Brecha" | null;
  pillClassName: string | null;
};

/**
 * Maps the closed spec's 5-tier classification down to the design's 3
 * visual buckets (decision #2 in the plan). The classification TEXT
 * itself is never altered — only the bar color/pill are derived here.
 */
export function getDimensionVisual(classification: DimensionClassification): DimensionVisual {
  switch (classification) {
    case "Fortaleza consolidada":
    case "Funcional":
      return {
        barColorClass: "bg-verde",
        pillLabel: "Fortaleza",
        pillClassName: "bg-verde text-bluenavy",
      };
    case "Área por fortalecer":
    case "Brecha prioritaria":
      return { barColorClass: "bg-azul", pillLabel: null, pillClassName: null };
    case "Brecha crítica":
      return {
        barColorClass: "bg-acento1/45",
        pillLabel: "Brecha",
        pillClassName: "bg-acento1 text-white",
      };
    default:
      return { barColorClass: "bg-azul", pillLabel: null, pillClassName: null };
  }
}
