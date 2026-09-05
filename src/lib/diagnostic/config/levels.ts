import type { Level } from "../types";

export const LEVELS: Level[] = ["Inicial", "En desarrollo", "Preparada", "Avanzada"];

/**
 * Ordinal hierarchy used by `capLevel` — higher number = higher readiness.
 * Caps can only move a level down to a lower number, never up (spec §17).
 */
export const LEVEL_ORDER: Record<Level, number> = {
  Inicial: 1,
  "En desarrollo": 2,
  Preparada: 3,
  Avanzada: 4,
};

/**
 * Continuous interval thresholds on the internal decimal IPRS (spec §14).
 * IPRS < 25 -> Inicial, 25-<50 -> En desarrollo, 50-<75 -> Preparada, >=75 -> Avanzada.
 */
export const LEVEL_THRESHOLDS = {
  enDesarrollo: 25,
  preparada: 50,
  avanzada: 75,
} as const;

export type LevelInterpretation = {
  title: string;
  text: string;
  objective: string;
};

/** Verbatim level interpretation copy (spec §40). */
export const LEVEL_INTERPRETATION: Record<Level, LevelInterpretation> = {
  Inicial: {
    title: "Nivel Inicial",
    text: "Tu empresa se encuentra en una etapa inicial de preparación para estructurar un Reporte de Sostenibilidad.\n\nAntes de concentrarse únicamente en la elaboración del documento, conviene fortalecer algunos elementos base como la identificación de impactos, la organización de información, los indicadores y las responsabilidades internas.",
    objective: "Construir las bases del proceso de reporte.",
  },
  "En desarrollo": {
    title: "Nivel En desarrollo",
    text: "Tu empresa ya cuenta con algunos elementos necesarios para desarrollar un Reporte de Sostenibilidad, pero todavía existen brechas que pueden dificultar la consistencia, trazabilidad o continuidad del proceso.\n\nEl siguiente paso es estructurar y formalizar los componentes que actualmente funcionan de manera parcial.",
    objective: "Convertir iniciativas aisladas en un proceso estructurado.",
  },
  Preparada: {
    title: "Nivel Preparada",
    text: "Tu empresa cuenta con una base relevante para desarrollar o fortalecer su Reporte de Sostenibilidad.\n\nExisten procesos, información o capacidades que pueden aprovecharse, aunque todavía hay áreas que conviene fortalecer antes de consolidar un proceso más robusto.",
    objective: "Cerrar brechas y consolidar el proceso de reporte.",
  },
  Avanzada: {
    title: "Nivel Avanzada",
    text: "Tu empresa cuenta con un nivel alto de preparación para desarrollar y fortalecer su Reporte de Sostenibilidad.\n\nLa siguiente oportunidad consiste en mejorar la integración de la información de sostenibilidad con la gestión, la toma de decisiones y los procesos de mejora continua.",
    objective: "Pasar del reporte a una gestión de sostenibilidad cada vez más integrada.",
  },
};
