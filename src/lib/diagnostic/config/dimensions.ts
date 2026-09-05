import type { DimensionId } from "../types";

export type DimensionDefinition = {
  id: DimensionId;
  name: string;
  questionIds: string[];
  weight: number;
  minimumScore: number;
  maximumScore: number;
  critical: boolean;
};

/**
 * The 5 IPRS dimensions, their constituent questions, weights, and
 * normalization bounds (spec §7, §12). D2 and D3 are the two critical
 * dimensions that drive the critical-gap level caps (spec §15).
 */
export const DIMENSIONS: Record<DimensionId, DimensionDefinition> = {
  D1: {
    id: "D1",
    name: "Gobernanza y estrategia",
    questionIds: ["q4", "q5", "q6"],
    weight: 0.2,
    minimumScore: 3,
    maximumScore: 12,
    critical: false,
  },
  D2: {
    id: "D2",
    name: "Materialidad y grupos de interés",
    questionIds: ["q7", "q8"],
    weight: 0.2,
    minimumScore: 2,
    maximumScore: 8,
    critical: true,
  },
  D3: {
    id: "D3",
    name: "Datos, indicadores y trazabilidad",
    questionIds: ["q9", "q10", "q11"],
    weight: 0.3,
    minimumScore: 3,
    maximumScore: 12,
    critical: true,
  },
  D4: {
    id: "D4",
    name: "Estándares y divulgación",
    questionIds: ["q12", "q13"],
    weight: 0.15,
    minimumScore: 2,
    maximumScore: 8,
    critical: false,
  },
  D5: {
    id: "D5",
    name: "Gestión, mejora y aseguramiento",
    questionIds: ["q14", "q15"],
    weight: 0.15,
    minimumScore: 2,
    maximumScore: 8,
    critical: false,
  },
};

export const DIMENSION_IDS: DimensionId[] = ["D1", "D2", "D3", "D4", "D5"];

export const CRITICAL_DIMENSION_IDS: DimensionId[] = DIMENSION_IDS.filter(
  (id) => DIMENSIONS[id].critical,
);
