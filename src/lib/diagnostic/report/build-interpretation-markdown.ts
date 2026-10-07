import { COMPANY_SIZE_OPTIONS } from "../../../components/diagnostic/copy";
import type { LeadFormValues } from "../../diagnostic-submission";
import { DIMENSIONS, DIMENSION_IDS } from "../config/dimensions";
import { QUESTIONS } from "../config/questions";
import { generateSalesInsights } from "../domain/generate-sales-insights";
import type { Answer, DiagnosticInput, DiagnosticResult, DimensionId, Question } from "../types";

/**
 * Same shape as the `Attribution` type hand-rolled in
 * src/pages/api/submit-diagnostic.ts — duplicated rather than imported
 * (lib code shouldn't depend on a page route), matched structurally.
 */
export type InterpretationAttribution = Partial<{
  source: string;
  landingPage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
}>;

export type BuildInterpretationMarkdownInput = {
  id: string;
  createdAt: string;
  lead: LeadFormValues;
  answers: DiagnosticInput;
  attribution?: InterpretationAttribution;
  result: DiagnosticResult;
};

/**
 * `Empresa Grande S.A.` -> `empresa-grande-sa`, for a readable local
 * filename. `\p{M}` (Unicode "Mark" category) strips the combining
 * diacritics NFD split accented letters into — same effect as
 * conceptKey's `̀-ͯ` range in merge-q1-objectives.ts, spelled
 * via a Unicode property escape instead of a hardcoded codepoint range.
 */
export function slugifyCompanyName(company: string): string {
  return (
    company
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "empresa"
  );
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * `"large"` -> `"Una gran empresa (251–1,000 empleados)"` — reuses the
 * exact same labels the lead saw on the form (COMPANY_SIZE_OPTIONS,
 * components/diagnostic/copy.ts) instead of showing the raw option id.
 * Falls back to the raw id for a value outside the known set, rather
 * than silently dropping it.
 */
function companySizeLabel(companySize: string): string {
  const option = COMPANY_SIZE_OPTIONS.find((candidate) => candidate.id === companySize);
  return option ? `${option.narrativePhrase} (${option.label})` : companySize;
}

function formatUtm(attribution?: InterpretationAttribution): string {
  const parts = [
    attribution?.utmSource && `source=${attribution.utmSource}`,
    attribution?.utmMedium && `medium=${attribution.utmMedium}`,
    attribution?.utmCampaign && `campaign=${attribution.utmCampaign}`,
    attribution?.utmContent && `content=${attribution.utmContent}`,
    attribution?.utmTerm && `term=${attribution.utmTerm}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "sin campaña UTM";
}

function buildHeader(input: BuildInterpretationMarkdownInput): string {
  const { id, createdAt, lead, attribution } = input;
  return [
    "# Ficha de preparación para reunión comercial",
    `## ${lead.company} — Diagnóstico IPRS`,
    "",
    `**ID de envío:** \`${id}\``,
    `**Fecha de envío:** ${formatDate(createdAt)}`,
    `**Contacto:** ${lead.firstName} ${lead.lastName} — ${lead.jobTitle}`,
    `**Empresa:** ${lead.company}`,
    `**Tamaño:** ${companySizeLabel(lead.companySize)}`,
    `**Industria:** ${lead.industry}`,
    `**Correo:** ${lead.email}`,
    `**Teléfono:** ${lead.phone || "No proporcionado"}`,
    `**Origen:** ${attribution?.landingPage ?? "—"}, referido desde ${attribution?.referrer ?? "desconocido"} (${formatUtm(attribution)})`,
  ].join("\n");
}

function criticalGapDimensionLabel(id: DimensionId): string {
  return `Dimensión ${id} (${DIMENSIONS[id].name})`;
}

function buildGlobalResultSection(result: DiagnosticResult): string {
  const criticalGapLabel = result.criticalGap
    ? `Sí — ${result.criticalGapDimensions.map(criticalGapDimensionLabel).join(", ")}`
    : "No";

  const lines = [
    "## 1. Resultado global",
    "",
    "| Indicador | Valor |",
    "|---|---|",
    `| **IPRS (puntaje)** | **${result.iprs.toFixed(2)} / 100** (mostrado: ${result.displayIprs}) |`,
    `| **Nivel calculado** | ${result.calculatedLevel} |`,
    `| **Nivel final** | ${result.finalLevel}${result.calculatedLevel !== result.finalLevel ? " ⚠️" : ""} |`,
    `| **Brecha crítica detectada** | ${criticalGapLabel} |`,
    `| **Nivel de incertidumbre** | ${result.uncertaintyFlag ? "Alto" : "Bajo"} (${(result.uncertaintyRate * 100).toFixed(0)}% de respuestas "no estoy seguro/a") |`,
  ];

  if (result.whyThisLevel) {
    lines.push(
      "",
      "### ¿Por qué el nivel final es menor al calculado?",
      "",
      `**Mensaje que vio la empresa:** *"${result.whyThisLevel}"*`,
    );
  }

  return lines.join("\n");
}

function answersForDimension(answers: DiagnosticInput, questionIds: string[]): string[] {
  return questionIds.map((questionId) => {
    const question = QUESTIONS.find((candidate) => candidate.id === questionId);
    const answer = answers[questionId as keyof DiagnosticInput] as Answer;
    return `  - ${question?.text ?? questionId} → **${answer.label}**`;
  });
}

function buildDimensionsSection(input: BuildInterpretationMarkdownInput): string {
  const { answers, result } = input;
  const lines = [
    "## 2. Dónde están: fortalezas y brechas por dimensión",
    "",
    "| Dimensión | Peso | Puntaje | Clasificación |",
    "|---|---|---|---|",
  ];

  for (const dimensionId of DIMENSION_IDS) {
    const dimension = result.dimensions[dimensionId];
    const weight = `${Math.round(DIMENSIONS[dimensionId].weight * 100)}%`;
    lines.push(
      `| ${dimension.name}${dimension.critical ? " (crítica)" : ""} | ${weight} | ${dimension.displayScore} | ${dimension.classification} |`,
    );
  }

  lines.push("", "### Fortalezas");
  if (result.strengths.length === 0) {
    lines.push("", "Ninguna dimensión alcanzó el umbral de fortaleza (≥ 70) en este diagnóstico.");
  } else {
    result.strengths.forEach((strength, index) => {
      lines.push(
        "",
        `${index + 1}. **${strength.name} (${strength.displayScore}, ${strength.classification})**`,
        ...answersForDimension(answers, DIMENSIONS[strength.dimensionId].questionIds),
      );
    });
  }

  // "consolidation-opportunities" means every dimension already scored
  // >= 70 (spec §22, scenario B) — there are no real gaps, so the header
  // must say so instead of calling out two merely-lower-but-still-strong
  // dimensions as "Brechas".
  lines.push(
    "",
    result.gapsScenario === "consolidation-opportunities"
      ? "### Oportunidades de consolidación (sin brechas relevantes)"
      : "### Brechas",
  );
  result.gaps.forEach((gap, index) => {
    lines.push(
      "",
      `${index + 1}. **${gap.name} (${gap.displayScore}, ${gap.classification})**`,
      ...answersForDimension(answers, DIMENSIONS[gap.dimensionId].questionIds),
    );
  });

  return lines.join("\n");
}

function buildRecommendationsSection(result: DiagnosticResult): string {
  const lines = ["## 3. Recomendaciones generadas por el motor", ""];
  result.recommendations.forEach((recommendation, index) => {
    lines.push(`${index + 1}. **${recommendation.title}** (${recommendation.category})`, `   ${recommendation.description}`, "");
  });
  return lines.join("\n").trimEnd();
}

function formatAnswer(question: Question, answer: Answer | Answer[] | string | undefined): string {
  if (question.id === "q17") {
    const text = typeof answer === "string" ? answer.trim() : "";
    return text ? `> ${text}` : "> _No fue respondida en este envío._";
  }
  if (!answer) {
    return "> _No fue respondida en este envío._";
  }
  if (Array.isArray(answer)) {
    return answer.map((item) => `> - ${item.label}`).join("\n");
  }
  const scoreNote = question.scored
    ? ` *(Dimensión ${question.dimension}, score ${answer.score}/4)*`
    : question.id === "q16"
      ? " *(no puntúa)*"
      : "";
  return `> ${answer.label}${scoreNote}`;
}

/** Mirrors the 3 subsections of the manual brief precedent — Question.block already carries this grouping, so no new authoring is needed. */
const BLOCK_HEADING: Record<Question["block"], string> = {
  context: "### Preguntas de personalización (no puntúan, solo orientan CTA/recomendaciones)",
  assessment: "### Preguntas que puntúan (Q4–Q15, construyen el IPRS)",
  additional: "### Preguntas finales (no puntúan — contexto cualitativo adicional)",
};

function buildQuestionsSection(answers: DiagnosticInput): string {
  const lines = ["## 4. Preguntas y respuestas completas del cliente", ""];
  const sorted = [...QUESTIONS].sort((a, b) => a.number - b.number);

  let lastBlock: Question["block"] | null = null;
  for (const question of sorted) {
    if (question.block !== lastBlock) {
      lines.push(BLOCK_HEADING[question.block], "");
      lastBlock = question.block;
    }
    const answer = answers[question.id as keyof DiagnosticInput];
    lines.push(`**Q${question.number}. ${question.text}**`);
    if (question.type === "multiple" && question.maxSelections) {
      lines.push(`*(selección múltiple, hasta ${question.maxSelections} opciones)*`);
    }
    lines.push(formatAnswer(question, answer), "");
  }

  return lines.join("\n").trimEnd();
}

function buildCTASection(result: DiagnosticResult): string {
  const { cta } = result;
  const lines = [
    "## 5. CTA generado",
    "",
    `- **Ruta:** \`${cta.route}\``,
    `- **Título:** ${cta.title}`,
    "- **Mensaje:**",
    // cta.body's line breaks are meaningful (generate-cta.ts documents the
    // "Enfocado en: ..." line as deliberately separate) — preserved here
    // as a nested list rather than flattened into one run-on sentence.
    ...cta.body.split("\n").map((line) => `  - ${line}`),
  ];
  if (cta.modifier) lines.push(`- **Modificador por brecha crítica:** ${cta.modifier}`);
  // cta.nextStep already reads as a full sentence ("Próximo paso sugerido:
  // construir bases.", per generate-cta.ts) — no extra label here, or it
  // reads as "Próximo paso sugerido: Próximo paso sugerido: ...".
  lines.push(`- ${cta.nextStep}`, `- **Botón:** ${cta.buttonLabel}`);
  return lines.join("\n");
}

function buildSalesInsightsSection(answers: DiagnosticInput, result: DiagnosticResult): string {
  const insights = generateSalesInsights({ answers, result });
  const lines = ["## 6. Puntos clave para cerrar la reunión", ""];
  if (insights.length === 0) {
    lines.push("No se detectaron patrones adicionales para esta sección.");
  } else {
    insights.forEach((insight, index) => lines.push(`${index + 1}. ${insight}`));
  }
  return lines.join("\n");
}

const FOOTER =
  "*Generado automáticamente a partir del registro de Supabase (`diagnostic_submissions`), recalculado íntegramente con el motor de diagnóstico. Documento de uso interno para preparación comercial — contiene datos personales del lead, no distribuir fuera del equipo comercial.*";

/**
 * Builds the full sales-brief markdown for one diagnostic submission —
 * same structure, section-by-section, as `Interpretaciones/*-brief.md`
 * (the hand-written precedent this reproduces). Pure function: no I/O,
 * no side effects — callers decide where the result gets persisted/sent.
 */
export function buildInterpretationMarkdown(input: BuildInterpretationMarkdownInput): string {
  return [
    buildHeader(input),
    "---",
    buildGlobalResultSection(input.result),
    "---",
    buildDimensionsSection(input),
    "---",
    buildRecommendationsSection(input.result),
    "---",
    buildQuestionsSection(input.answers),
    "---",
    buildCTASection(input.result),
    "---",
    buildSalesInsightsSection(input.answers, input.result),
    "---",
    FOOTER,
  ].join("\n\n");
}
