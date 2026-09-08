import type { CTARoute, Level } from "../types";

export type CTARouteDefinition = {
  title: string;
  body: string;
  buttonLabel: string;
};

/** The 5 CTA route definitions, verbatim (spec §29–33). */
export const CTA_ROUTES: Record<CTARoute, CTARouteDefinition> = {
  training: {
    title: "Desarrolla las capacidades de tu equipo para construir el reporte internamente",
    body: "Tu diagnóstico muestra las áreas que conviene fortalecer para estructurar el proceso. Podemos ayudarte a desarrollar las capacidades necesarias para que tu equipo avance con mayor claridad y metodología.",
    buttonLabel: "Quiero conocer la capacitación",
  },
  consulting: {
    title: "Acelera y estructura tu proceso de Reporte de Sostenibilidad",
    body: "Podemos acompañar a tu empresa para convertir las brechas identificadas en un proceso de reporte más estructurado, trazable y alineado con sus objetivos.",
    buttonLabel: "Quiero conocer el acompañamiento",
  },
  specialist: {
    title: "Lleva tu Reporte de Sostenibilidad con apoyo especializado",
    body: "Podemos acompañar a tu empresa en la estructuración y elaboración de su Reporte de Sostenibilidad, desde la organización de la información hasta la integración del documento.",
    buttonLabel: "Quiero hablar con un especialista",
  },
  review: {
    title: "Fortalece la confiabilidad de la información de tu reporte",
    body: "El siguiente paso puede ser revisar la estructura, consistencia, evidencia y trazabilidad de la información utilizada en el reporte.",
    buttonLabel: "Quiero revisar mi reporte",
  },
  "diagnostic-review": {
    title: "Define el siguiente paso a partir de tus brechas",
    body: "Tu diagnóstico permite identificar qué áreas requieren atención primero y qué tipo de apoyo puede resultar más adecuado para tu organización.",
    buttonLabel: "Quiero revisar mis resultados con un especialista",
  },
};

/**
 * "Sin brechas relevantes" copy overrides, applied on top of `CTA_ROUTES`
 * only when `hasGaps` is false (approved adjustments doc §4/§5/§7/§8,
 * 2026-09-07). `CTA_ROUTES` above is always the "con brechas" copy —
 * unchanged so it stays the literal default. `specialist` intentionally has
 * no entry: it never varies by hasGaps.
 */
export const CTA_GAP_OVERRIDES: Partial<Record<CTARoute, Partial<CTARouteDefinition>>> = {
  training: {
    body: "Tu diagnóstico muestra una base sólida de preparación y algunas oportunidades para seguir consolidando el proceso. Podemos ayudarte a desarrollar las capacidades necesarias para que tu equipo avance con mayor autonomía y metodología.",
  },
  consulting: {
    body: "Podemos acompañar a tu empresa para seguir consolidando su proceso de reporte, fortaleciendo su estructura, trazabilidad y alineación con sus objetivos.",
  },
  review: {
    title: "Revisa y consolida la confiabilidad de la información de tu reporte",
  },
  "diagnostic-review": {
    title: "Define el siguiente paso a partir de tus resultados",
    body: "Tu diagnóstico permite identificar las principales oportunidades de consolidación y qué tipo de apoyo puede resultar más adecuado para tu organización.",
  },
};

/**
 * Short Q2-obstacle emphasis phrases layered onto the CTA copy (spec §28).
 * `q2_other` intentionally has no entry — "no inventar un énfasis específico".
 */
export const Q2_CTA_EMPHASIS: Record<string, string> = {
  q2_knowledge: "capacidades internas y metodología",
  q2_resources: "estructura del proyecto, responsables y apoyo externo",
  q2_data: "recopilación, indicadores, fuentes y trazabilidad",
  q2_engagement: "coordinación transversal y participación de áreas",
  q2_budget: "priorización por etapas y recursos",
  q2_start: "hoja de ruta y secuencia de actividades",
};

/** Tone verb per finalLevel — copy-only, never changes route/IPRS/dimensions/level (spec §28). */
export const LEVEL_TONE: Record<Level, string> = {
  Inicial: "construir bases",
  "En desarrollo": "estructurar y formalizar",
  Preparada: "cerrar brechas y consolidar",
  Avanzada: "optimizar, integrar y fortalecer",
};

/**
 * D2/D3 critical-gap CTA modifiers (spec §34). When both are <40, `both`
 * takes priority and replaces the other two — never concatenate all three.
 */
export const CTA_MODIFIERS = {
  d2Only:
    "Una de las prioridades identificadas es fortalecer materialidad y grupos de interés antes de avanzar hacia un proceso de reporte más robusto.",
  d3Only:
    "Una de las principales prioridades es fortalecer indicadores, responsables, fuentes y trazabilidad de la información.",
  both: "Antes de concentrarse únicamente en la redacción del reporte, conviene fortalecer la estructura base del proceso: materialidad, información, responsables y trazabilidad.",
} as const;
