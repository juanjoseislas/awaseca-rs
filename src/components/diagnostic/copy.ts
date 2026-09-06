import type { DimensionId } from "../../lib/diagnostic";

/**
 * All Phase-2-authored UI copy (not part of the closed IPRS methodology).
 * Kept separate from component code so a future English variant, or a
 * copy review pass, touches only this file.
 */

export const NAV_COPY = {
  next: "Siguiente",
  back: "‹ Atrás",
  seeResults: "Ver mi diagnóstico",
  startCta: "Comenzar diagnóstico",
  skip: "Omitir",
  continueProgress: "Continuar",
  restart: "Empezar de nuevo",
};

export const STAGE_LABELS = {
  perfil: "Perfil",
  diagnostico: "Diagnóstico",
  contacto: "Contacto",
};

export const INTRO_COPY = {
  eyebrow: "Diagnóstico gratuito",
  title: "Descubre qué tan preparada está tu empresa para reportar sostenibilidad",
  subtitle: "15 preguntas · 5 minutos · Diagnóstico gratuito",
  body: "Responde este breve diagnóstico y recibe tu Índice de Preparación para Reportes de Sostenibilidad (IPRS), con tus principales fortalezas, brechas y próximos pasos.",
};

export const RESUME_PROMPT_COPY = {
  title: "Tienes un diagnóstico en progreso",
  body: "¿Quieres continuar donde lo dejaste o empezar de nuevo?",
};

export const COMPLETED_COPY = {
  eyebrow: "100% completado",
  title: "Diagnóstico completado",
  body: "Ya respondiste todas las preguntas principales. Antes de mostrarte tu resultado, dos preguntas opcionales nos ayudan a entender mejor tu contexto.",
  continueLabel: "Continuar",
};

export const PRE_RESULT_COPY = {
  eyebrow: "Antes de mostrarte tu resultado",
  title: "Un poco más de contexto",
  body: "Estas dos preguntas son opcionales y no afectan tu puntaje.",
};

export const LEAD_GATE_COPY = {
  eyebrow: "Último paso",
  title: "Tu diagnóstico está listo",
  body: "Hemos analizado tus respuestas y ya tenemos tu nivel de preparación, principales fortalezas, brechas y recomendaciones.\n\nCompleta tus datos para ver tu diagnóstico.",
  submitLabel: "Ver mi diagnóstico",
  submittingLabel: "Calculando tu diagnóstico...",
  fields: {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo corporativo",
    company: "Empresa",
    jobTitle: "Cargo / puesto",
    companySize: "Tamaño de empresa",
    industry: "Sector / industria",
    phone: "Teléfono (opcional)",
  },
};

export const COMPANY_SIZE_OPTIONS = [
  { id: "small", label: "1–50 empleados", narrativePhrase: "Una pequeña empresa" },
  { id: "medium", label: "51–250 empleados", narrativePhrase: "Una mediana empresa" },
  { id: "large", label: "251–1,000 empleados", narrativePhrase: "Una gran empresa" },
  { id: "enterprise", label: "Más de 1,000 empleados", narrativePhrase: "Una gran corporación" },
];

export const VALIDATION_COPY = {
  selectOne: "Selecciona una opción para continuar.",
  selectAtLeastOne: "Selecciona al menos una opción.",
  selectAtMost: (max: number) => `Puedes seleccionar máximo ${max} opciones.`,
  required: "Este campo es obligatorio.",
  invalidEmail: "Ingresa un correo electrónico válido.",
};

export const RESULTS_COPY = {
  hero: {
    levelLabel: "Tu nivel de preparación",
    pointsToNext: (points: number, nextLevel: string) =>
      `Estás a ${points} puntos de alcanzar el nivel ${nextLevel}`,
    maxLevelReached: "Has alcanzado el nivel más alto de preparación",
  },
  whatItMeans: { eyebrow: "¿Qué significa?" },
  dimensionMap: {
    eyebrow: "Mapa de preparación",
    title: "Tu desempeño por dimensión",
    subtitle: "Basado en tus respuestas, este es cómo se distribuye tu nivel de preparación en cada área.",
    legend: {
      strength: "Fortaleza (≥70)",
      inProgress: "En proceso (40–69)",
      gap: "Brecha (<40)",
    },
  },
  strengths: {
    eyebrow: "Tus principales fortalezas",
    title: "En qué estás por encima del promedio",
    noStrengthsEyebrow: "Tus áreas con mayor nivel de preparación",
  },
  gaps: {
    eyebrow: "Tus principales brechas",
    title: "Dónde hay trabajo urgente por hacer",
    consolidationEyebrow: "Áreas con mayor oportunidad de consolidación",
    consolidationTitle: "Dónde consolidar aún más tu preparación",
  },
  recommendations: {
    eyebrow: "Qué deberías priorizar",
    title: "Tus próximos pasos",
  },
  companyContext: {
    eyebrow: "Contexto de tu empresa",
    title: "Basado en tus respuestas",
  },
  finalCta: {
    eyebrow: "Siguiente paso",
    trustBadge: "empresas acompañadas en América Latina",
    disclaimerNote: "Sin compromiso · Respuesta en menos de 24 h",
    shareLink: "Compartir mis resultados →",
  },
};

/**
 * New Phase-2-authored copy (decision #3 in the plan): a short,
 * dimension-generic description line for the strength/gap cards, since
 * Phase 1's StrengthItem/GapItem carry no prose. Flagged for review — not
 * part of the closed methodology.
 */
/**
 * Used only for the two "reference, not a real strength/gap" fallbacks
 * (spec §21/§22): when no dimension qualifies as a strength, or when
 * every dimension is >=70 and there are no real gaps. In both cases the
 * spec requires showing up to 2 comparative dimensions WITHOUT calling
 * them strengths/gaps and WITHOUT inventing a positive/negative claim —
 * so this copy is deliberately neutral, not per-dimension.
 */
export const REFERENCE_CARD_COPY = {
  higherPreparedness: "Una de tus áreas con mejor puntuación relativa dentro de este diagnóstico.",
  consolidationOpportunity: "Una de las áreas con puntuación comparativamente menor, dentro de un resultado general sólido.",
};

export const DIMENSION_INSIGHT_COPY: Record<DimensionId, { strength: string; gap: string }> = {
  D1: {
    strength:
      "Cuentas con una gobernanza de sostenibilidad activa: riesgos identificados, objetivos definidos y seguimiento en marcha.",
    gap: "La gobernanza de sostenibilidad aún requiere estructurarse: riesgos, objetivos y seguimiento definidos con claridad.",
  },
  D2: {
    strength:
      "Cuentas con un proceso sólido de materialidad y relación con tus grupos de interés.",
    gap: "La identificación y priorización de grupos de interés, y tu estudio de materialidad, aún requieren fortalecerse.",
  },
  D3: {
    strength:
      "Tus indicadores, responsables y evidencias están bien organizados y son trazables.",
    gap: "La medición, trazabilidad y responsables de tus indicadores de sostenibilidad aún necesitan consolidarse.",
  },
  D4: {
    strength: "Conoces y aplicas estándares de reporte relevantes para tu organización.",
    gap: "El conocimiento y aplicación de estándares de reporte (GRI, NIIF S1/S2) aún es un área por desarrollar.",
  },
  D5: {
    strength:
      "Utilizas los resultados de tus reportes para mejorar tu gestión y cuentas con mecanismos de aseguramiento.",
    gap: "Convertir los resultados del reporte en mejoras de gestión, y avanzar hacia mecanismos de aseguramiento, es una oportunidad clave.",
  },
};
