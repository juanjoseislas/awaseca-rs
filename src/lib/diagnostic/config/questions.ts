import type { Question } from "../types";

/**
 * The 17-question IPRS questionnaire, verbatim from the closed methodology
 * spec. Do not reword labels, add/remove options, or change scores — this
 * content is a fixed specification, not editorial copy.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    number: 1,
    block: "context",
    text: "¿Qué te gustaría lograr principalmente con tu próximo Reporte de Sostenibilidad?",
    type: "multiple",
    required: true,
    scored: false,
    maxSelections: 2,
    options: [
      { id: "q1_regulatory", label: "Cumplir con requerimientos regulatorios o legales." },
      { id: "q1_clients", label: "Responder a requerimientos de clientes." },
      {
        id: "q1_investors",
        label:
          "Responder a requerimientos de inversionistas, bancos u otras instituciones financieras.",
      },
      { id: "q1_corporate", label: "Cumplir con requerimientos corporativos o de casa matriz." },
      { id: "q1_standards", label: "Alinear nuestro reporte con estándares internacionales." },
      {
        id: "q1_transparency",
        label: "Mejorar la transparencia y comunicación con nuestros grupos de interés.",
      },
      {
        id: "q1_management",
        label: "Utilizar el reporte para fortalecer nuestra gestión de sostenibilidad.",
      },
      {
        id: "q1_ifrs",
        label: "Prepararnos para nuevos requerimientos de divulgación, como las NIIF S1 y S2.",
      },
      { id: "q1_other", label: "Otro." },
    ],
  },
  {
    id: "q2",
    number: 2,
    block: "context",
    text: "¿Cuál es hoy el principal obstáculo para elaborar o fortalecer tu Reporte de Sostenibilidad?",
    type: "single",
    required: true,
    scored: false,
    options: [
      { id: "q2_knowledge", label: "Falta de conocimiento o experiencia." },
      { id: "q2_resources", label: "Falta de tiempo o recursos internos." },
      { id: "q2_data", label: "Dificultad para recopilar y organizar la información." },
      { id: "q2_engagement", label: "Falta de involucramiento de otras áreas." },
      { id: "q2_budget", label: "Presupuesto." },
      { id: "q2_start", label: "No sabemos por dónde empezar." },
      { id: "q2_other", label: "Otro." },
    ],
  },
  {
    id: "q3",
    number: 3,
    block: "context",
    text: "¿Qué tipo de apoyo necesita actualmente tu empresa para avanzar?",
    type: "single",
    required: true,
    scored: false,
    options: [
      { id: "q3_training", label: "Capacitación para desarrollar el reporte internamente." },
      { id: "q3_consulting", label: "Consultoría y/o acompañamiento especializado." },
      { id: "q3_specialist", label: "Contratar a un especialista para elaborar el reporte." },
      { id: "q3_review", label: "Revisión o verificación independiente." },
      { id: "q3_unsure", label: "Todavía no estamos seguros de qué necesitamos." },
    ],
  },
  {
    id: "q4",
    number: 4,
    block: "assessment",
    dimension: "D1",
    text: "¿Tu empresa ha elaborado anteriormente un Reporte de Sostenibilidad?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q4_regular", label: "Sí, lo hacemos regularmente.", score: 4 },
      { id: "q4_irregular", label: "Sí, pero no todos los años.", score: 3 },
      { id: "q4_once_twice", label: "Lo hemos hecho una o dos veces.", score: 2 },
      { id: "q4_first", label: "No, sería nuestro primer Reporte.", score: 1 },
    ],
  },
  {
    id: "q5",
    number: 5,
    block: "assessment",
    dimension: "D1",
    text: "¿Tu empresa tiene identificados sus principales riesgos e impactos ambientales, sociales y de gobernanza?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q5_documented", label: "Sí, están identificados y documentados.", score: 4 },
      { id: "q5_partial_high", label: "Sí, parcialmente.", score: 3 },
      {
        id: "q5_unsystematic",
        label: "Algunos están identificados, pero no de manera sistemática.",
        score: 2,
      },
      { id: "q5_no", label: "No.", score: 1 },
      { id: "q5_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q6",
    number: 6,
    block: "assessment",
    dimension: "D1",
    text: "¿Tu empresa cuenta con objetivos y metas de sostenibilidad definidos?",
    type: "single",
    required: true,
    scored: true,
    options: [
      {
        id: "q6_tracking",
        label: "Sí, para los principales temas y con seguimiento.",
        score: 4,
      },
      { id: "q6_main_topics", label: "Sí, para los principales temas.", score: 3 },
      { id: "q6_some", label: "Sí, para algunos temas.", score: 2 },
      { id: "q6_no", label: "No.", score: 1 },
      { id: "q6_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q7",
    number: 7,
    block: "assessment",
    dimension: "D2",
    text: "¿Tu empresa tiene identificados sus principales grupos de interés?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q7_prioritized", label: "Sí, están identificados y priorizados.", score: 4 },
      { id: "q7_identified", label: "Sí, están identificados.", score: 3 },
      { id: "q7_partial", label: "Parcialmente.", score: 2 },
      { id: "q7_no", label: "No.", score: 1 },
      { id: "q7_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q8",
    number: 8,
    block: "assessment",
    dimension: "D2",
    text: "¿Tu empresa cuenta con un estudio de materialidad realizado o actualizado en los últimos 3 años?",
    type: "single",
    required: true,
    scored: true,
    options: [
      {
        id: "q8_integrated",
        label: "Sí, está actualizado y forma parte de nuestro proceso de gestión.",
        score: 4,
      },
      { id: "q8_updated", label: "Sí, está actualizado.", score: 3 },
      { id: "q8_updating", label: "Está en proceso de actualización.", score: 2 },
      {
        id: "q8_old",
        label: "Tiene más de 3 años / requiere actualización.",
        score: 1,
      },
      { id: "q8_no", label: "No.", score: 1 },
      { id: "q8_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q9",
    number: 9,
    block: "assessment",
    dimension: "D3",
    text: "¿Tu empresa mide indicadores ambientales y sociales y cuenta con información histórica para comparar su evolución?",
    type: "single",
    required: true,
    scored: true,
    options: [
      {
        id: "q9_historical",
        label: "Sí, sistemáticamente y contamos con información histórica de 2 años o más.",
        score: 4,
      },
      {
        id: "q9_recent",
        label: "Sí, sistemáticamente, pero hemos comenzado recientemente.",
        score: 3,
      },
      {
        id: "q9_partial",
        label: "Medimos algunos indicadores, pero no sistemáticamente.",
        score: 2,
      },
      { id: "q9_no", label: "No medimos indicadores.", score: 1 },
      { id: "q9_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q10",
    number: 10,
    block: "assessment",
    dimension: "D3",
    text: "¿Tu empresa tiene definidos responsables y fuentes de información para los principales indicadores de sostenibilidad?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q10_formal", label: "Sí, formalmente definidos.", score: 4 },
      { id: "q10_informal", label: "Sí, pero de manera informal.", score: 3 },
      { id: "q10_partial", label: "Parcialmente.", score: 2 },
      { id: "q10_no", label: "No.", score: 1 },
      { id: "q10_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q11",
    number: 11,
    block: "assessment",
    dimension: "D3",
    text: "¿La información utilizada para el Reporte de Sostenibilidad cuenta con evidencia que permita verificar su origen y cálculo?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q11_systematic", label: "Sí, de manera sistemática.", score: 4 },
      {
        id: "q11_majority",
        label: "Sí, para la mayoría de los indicadores.",
        score: 3,
      },
      { id: "q11_some", label: "Solo para algunos indicadores.", score: 2 },
      { id: "q11_no", label: "No.", score: 1 },
      { id: "q11_unsure", label: "No estoy seguro/a.", score: 1, uncertainty: true },
    ],
  },
  {
    id: "q12",
    number: 12,
    block: "assessment",
    dimension: "D4",
    text: "¿Tu empresa utiliza los Estándares GRI para elaborar su Reporte de Sostenibilidad?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q12_structured", label: "Sí, de manera estructurada.", score: 4 },
      { id: "q12_partial", label: "Sí, parcialmente.", score: 3 },
      { id: "q12_other", label: "No, utilizamos otro enfoque.", score: 2 },
      { id: "q12_unknown", label: "No conocemos los Estándares GRI.", score: 1 },
      { id: "q12_no_report", label: "Aún no elaboramos un Reporte.", score: 1 },
    ],
  },
  {
    id: "q13",
    number: 13,
    block: "assessment",
    dimension: "D4",
    text: "¿Qué tan preparada está tu empresa para identificar y evaluar la posible relevancia de los requerimientos de divulgación de sostenibilidad relacionados con NIIF S1 y S2?",
    type: "single",
    required: true,
    scored: true,
    options: [
      {
        id: "q13_advancing",
        label: "Ya evaluamos su relevancia y estamos avanzando.",
        score: 4,
      },
      {
        id: "q13_evaluated",
        label: "Hemos evaluado su relevancia, pero aún no iniciamos.",
        score: 3,
      },
      {
        id: "q13_basic",
        label: "Tenemos conocimiento básico, pero no hemos evaluado su relevancia.",
        score: 2,
      },
      {
        id: "q13_unsure_applicability",
        label: "No sabemos si podrían aplicar a nuestra empresa.",
        score: 1,
      },
      { id: "q13_unknown", label: "No conocemos NIIF S1 y S2.", score: 1 },
    ],
  },
  {
    id: "q14",
    number: 14,
    block: "assessment",
    dimension: "D5",
    text: "¿Los resultados y oportunidades de mejora identificados en cada Reporte de Sostenibilidad se utilizan para mejorar la gestión del siguiente periodo?",
    type: "single",
    required: true,
    scored: true,
    options: [
      {
        id: "q14_systematic",
        label: "Sí, de manera sistemática y con seguimiento.",
        score: 4,
      },
      { id: "q14_some", label: "Sí, algunos resultados se utilizan.", score: 3 },
      {
        id: "q14_no_tracking",
        label: "Se identifican oportunidades, pero no se les da seguimiento sistemático.",
        score: 2,
      },
      { id: "q14_no", label: "No.", score: 1 },
      { id: "q14_no_report", label: "Aún no hemos elaborado un Reporte.", score: 1 },
    ],
  },
  {
    id: "q15",
    number: 15,
    block: "assessment",
    dimension: "D5",
    text: "¿El Reporte de Sostenibilidad de tu empresa cuenta con verificación o aseguramiento independiente de un tercero?",
    type: "single",
    required: true,
    scored: true,
    options: [
      { id: "q15_regular", label: "Sí, regularmente.", score: 4 },
      {
        id: "q15_some",
        label: "Sí, al menos en algunos periodos o indicadores.",
        score: 3,
      },
      { id: "q15_evaluating", label: "Estamos evaluando.", score: 2 },
      { id: "q15_no", label: "No.", score: 1 },
      { id: "q15_no_report", label: "Aún no elaboramos un Reporte.", score: 1 },
    ],
  },
  {
    id: "q16",
    number: 16,
    block: "additional",
    text: "¿La información de sostenibilidad se integra actualmente con otros procesos de gestión de la empresa?",
    type: "single",
    required: false,
    scored: false,
    options: [
      {
        id: "q16_integrated",
        label: "Sí, está integrada con procesos de gestión y toma de decisiones.",
      },
      { id: "q16_partial", label: "Sí, parcialmente." },
      {
        id: "q16_department",
        label: "Se gestiona principalmente desde el área de sostenibilidad.",
      },
      {
        id: "q16_independent",
        label: "Se gestiona mediante iniciativas independientes.",
      },
      { id: "q16_unsure", label: "No estoy seguro/a." },
    ],
  },
  {
    id: "q17",
    number: 17,
    block: "additional",
    text: "¿Hay alguna situación, reto o contexto adicional de tu empresa que quieras compartirnos?",
    type: "textarea",
    required: false,
    scored: false,
  },
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, question]),
);

/**
 * Lookup table of the score configured for a given (questionId, optionId)
 * pair. `calculateDiagnostic` uses this to re-derive scores from config
 * rather than trusting whatever score a caller attaches to an Answer
 * (spec §53/§55).
 */
export const SCORE_LOOKUP: Record<string, Record<string, number | undefined>> =
  Object.fromEntries(
    QUESTIONS.map((question) => [
      question.id,
      Object.fromEntries((question.options ?? []).map((option) => [option.id, option.score])),
    ]),
  );

/**
 * True when the given (questionId, optionId) pair is configured with
 * `uncertainty: true` — the only signal that counts toward uncertainty,
 * never an inferred `score === 1` (spec §19).
 */
export function isUncertaintyOption(questionId: string, optionId: string): boolean {
  const question = QUESTIONS_BY_ID[questionId];
  const option = question?.options?.find((candidate) => candidate.id === optionId);
  return option?.uncertainty === true;
}

/**
 * Authoritative score for a (questionId, optionId) pair, read from config —
 * never from a caller-supplied `Answer.score` (spec §53/§55). Throws if the
 * pair isn't a valid, scored combination, since that indicates corrupt or
 * tampered input rather than a legitimate answer.
 */
export function getConfiguredScore(questionId: string, optionId: string): number {
  const score = SCORE_LOOKUP[questionId]?.[optionId];
  if (score === undefined) {
    throw new Error(`No configured score for question "${questionId}" option "${optionId}"`);
  }
  return score;
}
