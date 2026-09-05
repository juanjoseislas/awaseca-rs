import type { RecommendationRule } from "../types";

/**
 * Priority numbers below are this implementation's concrete resolution of
 * the spec's ordinal tiers (spec §24 gives tiers, not numbers):
 *   100 -> D2/D3 critical-gap rules (tier 1: "D2 o D3 con brecha crítica")
 *    90 -> individual alerts the spec calls out explicitly as high-priority
 *          or semantically distinct (R-Q11 "alta", R-Q12-UNKNOWN-GRI, R-Q15)
 *    70 -> other dimension-level "critical" rules (D1/D4/D5 < 40)
 *    68 -> D1 "priority" band (40 <= D1 < 60), one notch below <40
 *    65 -> remaining individual sub-question rules (tier 3: "otras dimensiones <60")
 *    30 -> Q2 obstacle-derived rules (tier 4, lowest priority in this catalog)
 * Q1 (objective) and Q3 (support type) intentionally have no entries here —
 * they only flavor CTA copy (see generate-cta.ts / merge-q1-objectives.ts),
 * never the recommendation catalog (spec §46 engine separation).
 */
export const RECOMMENDATION_RULES: RecommendationRule[] = [
  // D1 — Gobernanza y estrategia
  {
    id: "R-D1-CRITICAL",
    priority: 70,
    category: "D1",
    deduplicationGroup: "governance",
    condition: ({ dimensions }) => dimensions.D1.score < 40,
    title: "Estructura la gobernanza de sostenibilidad",
    description:
      "Define los principales riesgos e impactos de sostenibilidad, establece objetivos y metas y asigna mecanismos de seguimiento para convertir las iniciativas actuales en un proceso de gestión más estructurado.",
  },
  {
    id: "R-D1-PRIORITY",
    priority: 68,
    category: "D1",
    deduplicationGroup: "governance",
    condition: ({ dimensions }) => dimensions.D1.score >= 40 && dimensions.D1.score < 60,
    title: "Formaliza objetivos, responsabilidades y seguimiento",
    description:
      "La organización ya cuenta con algunos elementos de gestión, pero conviene formalizarlos para asegurar continuidad y facilitar el proceso de reporte.",
  },
  {
    id: "R-Q5",
    priority: 65,
    category: "D1",
    deduplicationGroup: "governance",
    condition: ({ answers }) => (answers.q5.score ?? 0) <= 2,
    title: "Fortalece la identificación de riesgos e impactos",
    description:
      "Documenta de manera sistemática los principales riesgos e impactos ambientales, sociales y de gobernanza relevantes para la organización.",
  },
  {
    id: "R-Q6",
    priority: 65,
    category: "D1",
    deduplicationGroup: "governance",
    condition: ({ answers }) => (answers.q6.score ?? 0) <= 2,
    title: "Define objetivos y metas de sostenibilidad",
    description:
      "Convierte los temas prioritarios en objetivos medibles, responsables, indicadores y mecanismos de seguimiento.",
  },

  // D2 — Materialidad y grupos de interés (crítica)
  {
    id: "R-D2-CRITICAL",
    priority: 100,
    category: "D2",
    deduplicationGroup: "materiality",
    condition: ({ dimensions }) => dimensions.D2.score < 40,
    title: "Fortalece tu proceso de materialidad y grupos de interés",
    description:
      "Identifica y prioriza los principales grupos de interés y revisa el proceso utilizado para determinar los temas relevantes que deberán orientar el Reporte de Sostenibilidad.",
  },
  {
    id: "R-Q7",
    priority: 65,
    category: "D2",
    deduplicationGroup: "materiality",
    condition: ({ answers }) => (answers.q7.score ?? 0) <= 2,
    title: "Mapea y prioriza a tus grupos de interés",
    description:
      "Identifica quiénes pueden verse afectados por la organización o influir en ella y establece criterios para priorizar su participación en el proceso de sostenibilidad.",
  },
  {
    id: "R-Q8",
    priority: 65,
    category: "D2",
    deduplicationGroup: "materiality",
    condition: ({ answers }) => (answers.q8.score ?? 0) <= 2,
    title: "Revisa o desarrolla tu proceso de materialidad",
    description:
      "Antes de estructurar el contenido del reporte, revisa cómo se identifican, evalúan y priorizan los temas relevantes de sostenibilidad.",
  },

  // D3 — Datos, indicadores y trazabilidad (crítica)
  {
    id: "R-D3-CRITICAL",
    priority: 100,
    category: "D3",
    deduplicationGroup: "data",
    condition: ({ dimensions }) => dimensions.D3.score < 40,
    title: "Construye una base sólida de datos e indicadores",
    description:
      "Define los indicadores prioritarios, responsables, fuentes de información, metodología de cálculo y evidencias que permitan respaldar los datos utilizados en el reporte.",
  },
  {
    id: "R-Q9",
    priority: 65,
    category: "D3",
    deduplicationGroup: "data",
    condition: ({ answers }) => (answers.q9.score ?? 0) <= 2,
    title: "Fortalece tu sistema de indicadores",
    description:
      "Define indicadores ambientales y sociales consistentes y comienza a construir información histórica que permita analizar su evolución.",
  },
  {
    id: "R-Q10",
    priority: 65,
    category: "D3",
    deduplicationGroup: "data",
    condition: ({ answers }) => (answers.q10.score ?? 0) <= 2,
    title: "Formaliza responsables y fuentes de información",
    description:
      "Asigna responsables para cada indicador y documenta de dónde proviene la información necesaria para calcularlo.",
  },
  {
    id: "R-Q11",
    priority: 90,
    category: "D3",
    deduplicationGroup: "data",
    condition: ({ answers }) => (answers.q11.score ?? 0) <= 2,
    title: "Fortalece la trazabilidad de tus datos",
    description:
      "Documenta las fuentes, evidencias, criterios y cálculos utilizados para que los principales indicadores puedan ser rastreados y revisados.",
  },

  // D4 — Estándares y divulgación
  {
    id: "R-D4-CRITICAL",
    priority: 70,
    category: "D4",
    deduplicationGroup: "standards",
    condition: ({ dimensions }) => dimensions.D4.score < 40,
    title: "Fortalece el conocimiento sobre estándares y requerimientos de divulgación",
    description:
      "Evalúa qué marcos de reporte y divulgación son relevantes para la organización antes de definir la estructura final del reporte.",
  },
  {
    // Must check optionId, never score: q12_no_report also scores 1 but
    // means something different (no report exists yet vs. GRI unknown).
    id: "R-Q12-UNKNOWN-GRI",
    priority: 90,
    category: "D4",
    deduplicationGroup: "standards",
    condition: ({ answers }) => answers.q12.optionId === "q12_unknown",
    title: "Desarrolla capacidades sobre los Estándares GRI",
    description:
      "Evalúa cómo pueden utilizarse los Estándares GRI dentro del proceso de reporte de la organización de acuerdo con sus necesidades.",
  },
  {
    id: "R-Q13",
    priority: 65,
    category: "D4",
    deduplicationGroup: "standards",
    condition: ({ answers }) => (answers.q13.score ?? 0) <= 2,
    title: "Evalúa la relevancia de NIIF S1 y S2",
    description:
      "Realiza una primera evaluación para determinar qué relevancia podrían tener los requerimientos de divulgación relacionados con sostenibilidad y clima para la organización.",
  },

  // D5 — Gestión, mejora y aseguramiento
  {
    id: "R-D5-CRITICAL",
    priority: 70,
    category: "D5",
    deduplicationGroup: "management",
    condition: ({ dimensions }) => dimensions.D5.score < 40,
    title: "Conecta el reporte con un proceso de mejora continua",
    description:
      "Utiliza los hallazgos del reporte para definir acciones, responsables, indicadores y seguimiento durante el siguiente periodo.",
  },
  {
    id: "R-Q14",
    priority: 65,
    category: "D5",
    deduplicationGroup: "management",
    condition: ({ answers }) => (answers.q14.score ?? 0) <= 2,
    title: "Convierte los resultados del reporte en acciones de gestión",
    description:
      "Establece un mecanismo para dar seguimiento a oportunidades de mejora, compromisos y resultados identificados durante cada ciclo de reporte.",
  },
  {
    // Only when the company has reported before (q4 !== q4_first) but has
    // no assurance today. Must never fire on q15_no_report — that means no
    // report exists yet, so "gradually add assurance" doesn't apply.
    id: "R-Q15",
    priority: 90,
    category: "D5",
    deduplicationGroup: "management",
    condition: ({ answers }) =>
      answers.q15.optionId === "q15_no" && answers.q4.optionId !== "q4_first",
    title: "Evalúa gradualmente mecanismos de revisión o aseguramiento",
    description:
      "Si resulta pertinente para tus grupos de interés, analiza qué información crítica podría beneficiarse de procesos adicionales de revisión o aseguramiento independiente.",
  },

  // Q2 — obstacle-derived (lower priority than methodology gaps, spec §26).
  // q2_other intentionally has no rule ("no inventar un énfasis específico").
  {
    id: "R-Q2-KNOWLEDGE",
    priority: 30,
    category: "obstacle",
    condition: ({ answers }) => answers.q2.optionId === "q2_knowledge",
    title: "Desarrolla capacidades internas",
    description:
      "Prioriza capacitación sobre metodología de reporte, materialidad, indicadores y estándares relevantes para que el equipo pueda participar con mayor autonomía.",
  },
  {
    id: "R-Q2-RESOURCES",
    priority: 30,
    category: "obstacle",
    condition: ({ answers }) => answers.q2.optionId === "q2_resources",
    title: "Estructura el proyecto y define apoyos externos",
    description:
      "Establece alcance, responsables, calendario y actividades que pueden desarrollarse internamente o con acompañamiento especializado.",
  },
  {
    id: "R-Q2-DATA",
    priority: 30,
    category: "obstacle",
    condition: ({ answers }) => answers.q2.optionId === "q2_data",
    title: "Ordena primero el flujo de datos",
    description:
      "Construye una matriz de indicadores con responsables, fuentes, periodicidad, metodología de cálculo y evidencia.",
  },
  {
    id: "R-Q2-ENGAGEMENT",
    priority: 30,
    category: "obstacle",
    condition: ({ answers }) => answers.q2.optionId === "q2_engagement",
    title: "Convierte el reporte en un proyecto transversal",
    description:
      "Define responsables y mecanismos de coordinación con las áreas que generan la información necesaria para el reporte.",
  },
  {
    id: "R-Q2-BUDGET",
    priority: 30,
    category: "obstacle",
    condition: ({ answers }) => answers.q2.optionId === "q2_budget",
    title: "Prioriza el proceso por etapas",
    description:
      "Identifica primero las brechas críticas y concentra los recursos en los componentes que condicionan el resto del proceso.",
  },
  {
    id: "R-Q2-START",
    priority: 30,
    category: "obstacle",
    condition: ({ answers }) => answers.q2.optionId === "q2_start",
    title: "Construye una hoja de ruta",
    description:
      "Define el punto de partida, las principales brechas y una secuencia clara de actividades antes de comenzar la elaboración del documento.",
  },
];
