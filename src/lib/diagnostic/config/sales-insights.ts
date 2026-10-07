import type { SalesInsightRule } from "../types";
import { Q2_CTA_EMPHASIS } from "./ctas";

/**
 * Catalog of commercial talking points for the auto-generated sales brief
 * (see domain/generate-sales-insights.ts), one rule per row of the
 * approved specification (2026-10-05 planning session). Exactly 5 rules,
 * no priority/dedup: each condition is independent and any subset may
 * fire together for a given submission — same shape as RECOMMENDATION_RULES
 * but deliberately simpler since there's no overlap to resolve here.
 *
 * `critical-gap-coaching` is a framing note for the salesperson, not a
 * restatement of `result.whyThisLevel` — that exact copy already appears
 * verbatim in the "Resultado global" section of the generated brief.
 */
export const SALES_INSIGHT_RULES: SalesInsightRule[] = [
  {
    id: "critical-gap-coaching",
    condition: ({ result }) => result.criticalGap,
    text: () =>
      "El nivel final quedó limitado por una brecha crítica (ver sección 1). Conviene encuadrar la conversación como 'base sólida con un punto concreto por resolver', no como 'nivel bajo en general'.",
  },
  {
    id: "specialist-requested",
    condition: ({ answers }) => answers.q3.optionId === "q3_specialist",
    text: () =>
      "La empresa ya seleccionó 'contratar a un especialista' como el apoyo que busca: no es necesario vender el concepto de acompañamiento, solo acordar alcance y siguientes pasos.",
  },
  {
    id: "ifrs-regulatory-hook",
    condition: ({ answers }) => answers.q1.some((answer) => answer.optionId === "q1_ifrs"),
    text: () =>
      "Mencionaron prepararse para NIIF S1/S2 como uno de sus objetivos: es un gancho con urgencia regulatoria que puede ayudar a acelerar la decisión.",
  },
  {
    id: "stated-obstacle-scope",
    condition: ({ answers }) => Boolean(Q2_CTA_EMPHASIS[answers.q2.optionId]),
    text: ({ answers }) =>
      `Su obstáculo declarado (${Q2_CTA_EMPHASIS[answers.q2.optionId]}) sugiere que el alcance de la propuesta debe incluir un componente de coordinación interna, no solo trabajo técnico.`,
  },
  {
    id: "partial-integration-followup",
    condition: ({ answers }) => answers.q16?.optionId === "q16_partial",
    text: () =>
      "Dijeron que la información de sostenibilidad se integra 'parcialmente' con otros procesos de gestión: vale la pena preguntar en la reunión qué procesos ya están conectados y cuáles faltan.",
  },
];
