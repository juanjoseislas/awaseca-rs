/**
 * Priority concepts associated with each Q1 objective option (spec §27).
 * These flavor CTA copy only — they never change the CTA route, IPRS,
 * dimensions, or level. `q1_other` has no defined concepts.
 */
export const Q1_CONCEPTS: Record<string, string[]> = {
  q1_regulatory: ["Información", "Trazabilidad", "Requerimientos aplicables", "Gobernanza"],
  q1_clients: ["Indicadores", "Evidencias", "Trazabilidad", "Información solicitada por clientes"],
  q1_investors: ["Riesgos", "Información consistente", "Indicadores", "Divulgación"],
  q1_corporate: ["Homologación", "Información", "Responsables", "Procesos internos"],
  q1_standards: ["Metodología", "Estándares", "Estructura", "Divulgación"],
  q1_transparency: ["Materialidad", "Stakeholders", "Comunicación", "Transparencia"],
  q1_management: ["Objetivos", "Indicadores", "Seguimiento", "Mejora continua"],
  q1_ifrs: ["Evaluación de relevancia", "Riesgos y oportunidades", "Información", "Divulgación"],
  q1_other: [],
};
