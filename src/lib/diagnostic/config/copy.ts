/** "Resultado orientativo" copy shown when uncertaintyFlag is true (spec §20). */
export const UNCERTAINTY_COPY = {
  title: "Resultado orientativo",
  text: "Tu resultado debe interpretarse como una primera aproximación, ya que algunas respuestas indican que actualmente no se cuenta con información suficiente para evaluar determinados aspectos.",
};

/** Methodological disclaimer, verbatim (spec §56). */
export const DISCLAIMER_COPY = {
  title: "Nota metodológica",
  text: "Este diagnóstico es una herramienta orientativa diseñada para identificar el nivel de preparación de una organización para elaborar o fortalecer su Reporte de Sostenibilidad. Los resultados se basan en las respuestas proporcionadas y no constituyen una auditoría, certificación, verificación ni dictamen de cumplimiento con estándares, normas o requerimientos regulatorios.",
};

/** Q16 qualitative interpretation text, never affects scoring (spec §42). */
export const Q16_INTERPRETATION: Record<string, string> = {
  q16_integrated:
    "Tu empresa ya muestra señales de integración entre la información de sostenibilidad y los procesos de gestión y toma de decisiones.",
  q16_partial:
    "Existe una integración parcial de la sostenibilidad con otros procesos de gestión, que puede fortalecerse progresivamente.",
  q16_department:
    "La sostenibilidad se gestiona principalmente desde un área específica. Existe una oportunidad para ampliar su integración con otras funciones de la organización.",
  q16_independent:
    "Existe una oportunidad para conectar las iniciativas de sostenibilidad con procesos, objetivos e indicadores de gestión más amplios.",
  q16_unsure:
    "Puede ser útil revisar cómo se utiliza actualmente la información de sostenibilidad dentro de los procesos de gestión y toma de decisiones.",
};

/**
 * Approved/forbidden terminology (spec §57). Used by a config test to scan
 * all copy strings for forbidden phrasing that would overstate certification
 * or compliance the diagnostic does not actually confer.
 */
export const TERMINOLOGY = {
  permitted: [
    "Nivel de preparación",
    "Nivel de madurez",
    "Diagnóstico",
    "IPRS",
    "Fortaleza",
    "Brecha",
    "Área por fortalecer",
    "Preparación para reportar",
    "Relevancia",
    "Resultado orientativo",
  ],
  forbidden: [
    "Cumples con GRI",
    "No cumples con GRI",
    "Estás certificado en GRI",
    "Cumples con NIIF S1",
    "Cumples con NIIF S2",
    "No cumples con NIIF S1/S2",
    "Cumples legalmente",
    "Tu reporte está certificado",
    "Este diagnóstico garantiza cumplimiento",
  ],
};

/**
 * Static lead-capture copy (spec §36–37), stored here ready for a future
 * UI phase to import directly — no form logic or field validation is
 * implemented in this phase.
 */
export const LEAD_CAPTURE_COPY = {
  title: "Tu diagnóstico está listo",
  text: "Hemos analizado tus respuestas y ya tenemos tu nivel de preparación, principales fortalezas, brechas y recomendaciones.\n\nCompleta tus datos para ver tu diagnóstico.",
  submitButtonLabel: "Ver mi diagnóstico",
  requiredFields: [
    "firstName",
    "lastName",
    "email",
    "company",
    "jobTitle",
    "companySize",
    "industry",
  ] as const,
  optionalFields: ["phone"] as const,
};
