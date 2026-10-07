import { describe, expect, it } from "vitest";
import type { LeadFormValues } from "../../diagnostic-submission";
import { calculateDiagnostic } from "../domain/calculate-diagnostic";
import { TIER1_OPTIONS, TIER3_OPTIONS, TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { buildInterpretationMarkdown, slugifyCompanyName } from "./build-interpretation-markdown";

const LEAD: LeadFormValues = {
  firstName: "Darinka",
  lastName: "Gomar",
  email: "kgomar@example.com",
  company: "Expo Guadalajara",
  jobTitle: "Analista de sustentabilidad",
  companySize: "large",
  industry: "Turismo",
  phone: "3328232382",
};

describe("buildInterpretationMarkdown", () => {
  it("includes all 6 numbered sections plus the header and footer", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "649748ab-bb91-4c16-a2c8-d7eda15766bc",
      createdAt: "2026-10-01T21:26:37.424Z",
      lead: LEAD,
      answers,
      attribution: { landingPage: "/", referrer: "https://www.awaseca.com/" },
      result,
    });

    expect(markdown).toContain("# Ficha de preparación para reunión comercial");
    expect(markdown).toContain("## 1. Resultado global");
    expect(markdown).toContain("## 2. Dónde están: fortalezas y brechas por dimensión");
    expect(markdown).toContain("## 3. Recomendaciones generadas por el motor");
    expect(markdown).toContain("## 4. Preguntas y respuestas completas del cliente");
    expect(markdown).toContain("## 5. CTA generado");
    expect(markdown).toContain("## 6. Puntos clave para cerrar la reunión");
    expect(markdown).toContain("Documento de uso interno para preparación comercial");
  });

  it("shows a human company-size label (same copy the lead saw on the form), not the raw option id", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD, // companySize: "large"
      answers,
      result,
    });
    expect(markdown).toContain("**Tamaño:** Una gran empresa (251–1,000 empleados)");
    expect(markdown).not.toContain("**Tamaño:** large");
  });

  it("falls back to the raw companySize value when it doesn't match a known option", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: { ...LEAD, companySize: "unknown-size" },
      answers,
      result,
    });
    expect(markdown).toContain("**Tamaño:** unknown-size");
  });

  it("names critical-gap dimensions by their full Spanish name, not just the bare id", () => {
    const answers = buildInput(TIER1_OPTIONS); // D2 and D3 both land < 40
    const result = calculateDiagnostic(answers);
    expect(result.criticalGapDimensions).toEqual(["D2", "D3"]);

    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain(
      "Sí — Dimensión D2 (Materialidad y grupos de interés), Dimensión D3 (Datos, indicadores y trazabilidad)",
    );
  });

  it("groups Q1-17 under the 3 manual-brief subsections, in order (context -> assessment -> additional)", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });

    const contextIdx = markdown.indexOf("### Preguntas de personalización");
    const assessmentIdx = markdown.indexOf("### Preguntas que puntúan (Q4–Q15, construyen el IPRS)");
    const additionalIdx = markdown.indexOf("### Preguntas finales (no puntúan — contexto cualitativo adicional)");
    const q1Idx = markdown.indexOf("**Q1.");
    const q4Idx = markdown.indexOf("**Q4.");
    const q16Idx = markdown.indexOf("**Q16.");

    expect(contextIdx).toBeGreaterThan(-1);
    expect(assessmentIdx).toBeGreaterThan(contextIdx);
    expect(additionalIdx).toBeGreaterThan(assessmentIdx);
    expect(q1Idx).toBeGreaterThan(contextIdx);
    expect(q4Idx).toBeGreaterThan(assessmentIdx);
    expect(q16Idx).toBeGreaterThan(additionalIdx);

    // Each heading must appear exactly once — grouped, not repeated per question.
    expect(markdown.split("### Preguntas de personalización").length - 1).toBe(1);
    expect(markdown.split("### Preguntas que puntúan").length - 1).toBe(1);
    expect(markdown.split("### Preguntas finales").length - 1).toBe(1);

    expect(markdown).toContain("*(selección múltiple, hasta 2 opciones)*");
  });

  it("reproduces the known Expo Guadalajara figures exactly", () => {
    const answers = buildInput(
      {
        q7: "q7_identified",
        q8: "q8_integrated",
        q9: "q9_partial",
        q10: "q10_partial",
        q11: "q11_some",
        q12: "q12_partial",
        q13: "q13_basic",
        q14: "q14_no_tracking",
        q15: "q15_no",
        q4: "q4_regular",
        q5: "q5_documented",
        q6: "q6_main_topics",
      },
      { q1: ["q1_management", "q1_ifrs"], q2: "q2_engagement", q3: "q3_specialist", q16: "q16_partial" },
    );
    const result = calculateDiagnostic(answers);
    expect(result.displayIprs).toBe(54);
    expect(result.finalLevel).toBe("En desarrollo");
    expect(result.criticalGapDimensions).toEqual(["D3"]);

    const markdown = buildInterpretationMarkdown({
      id: "649748ab-bb91-4c16-a2c8-d7eda15766bc",
      createdAt: "2026-10-01T21:26:37.424Z",
      lead: LEAD,
      answers,
      result,
    });

    expect(markdown).toContain("54.44 / 100");
    expect(markdown).toContain("Nivel final** | En desarrollo ⚠️");
    expect(markdown).toContain("Datos, indicadores y trazabilidad");
    // All 5 sales-insight rules should fire for this answer set.
    expect(markdown).toContain("especialista");
    expect(markdown).toContain("NIIF S1/S2");
    expect(markdown).toContain(
      '**Mensaje que vio la empresa:** *"Aunque tu puntuación global corresponde a un nivel mayor, se identificó una brecha crítica en datos, indicadores y trazabilidad. Por esta razón, el nivel final se limita hasta fortalecer esta dimensión."*',
    );
  });

  it("labels the why-this-level quote as 'Mensaje que vio la empresa' (matching the manual brief precedent)", () => {
    // TIER4 baseline with D3 forced below 40 while IPRS stays >= 50 —
    // triggers the critical-gap level cap, which is the only condition
    // that populates result.whyThisLevel.
    const answers = buildInput(TIER4_OPTIONS, { q1: ["q1_regulatory"], q2: "q2_other", q3: "q3_training" });
    answers.q9 = { questionId: "q9", optionId: "q9_no", label: "No medimos indicadores.", score: 1 };
    answers.q10 = { questionId: "q10", optionId: "q10_no", label: "No.", score: 1 };
    answers.q11 = { questionId: "q11", optionId: "q11_no", label: "No.", score: 1 };
    const result = calculateDiagnostic(answers);
    expect(result.calculatedLevel).not.toBe(result.finalLevel);
    expect(result.whyThisLevel).toBeTruthy();

    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain(`**Mensaje que vio la empresa:** *"${result.whyThisLevel}"*`);
  });

  it("never calls the top dimensions 'Brechas' when there are no real gaps (consolidation-opportunities scenario)", () => {
    const answers = buildInput(TIER4_OPTIONS);
    const result = calculateDiagnostic(answers);
    expect(result.gapsScenario).toBe("consolidation-opportunities");

    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain("### Oportunidades de consolidación (sin brechas relevantes)");
    expect(markdown).not.toContain("### Brechas");
  });

  it("never double-labels cta.nextStep — it already reads as a full sentence", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    expect(result.cta.nextStep).toMatch(/^Próximo paso sugerido:/);

    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain(`- ${result.cta.nextStep}`);
    expect(markdown).not.toContain("Próximo paso sugerido: Próximo paso sugerido:");
  });

  it("preserves the CTA body's multi-line structure instead of flattening it into one sentence", () => {
    const answers = buildInput(TIER1_OPTIONS, { q1: ["q1_management"], q2: "q2_knowledge" });
    const result = calculateDiagnostic(answers);
    expect(result.cta.body).toContain("\n");

    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    for (const line of result.cta.body.split("\n")) {
      expect(markdown).toContain(`  - ${line}`);
    }
  });

  it("falls back to a plain message when no sales insight fires", () => {
    const answers = buildInput(TIER3_OPTIONS, { q2: "q2_other", q3: "q3_training" });
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain("No se detectaron patrones adicionales para esta sección.");
  });

  it("shows every answered question's label, including multi-select Q1", () => {
    const answers = buildInput(TIER1_OPTIONS, { q1: ["q1_management", "q1_ifrs"] });
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain("Utilizar el reporte para fortalecer nuestra gestión de sostenibilidad.");
    expect(markdown).toContain("Prepararnos para nuevos requerimientos de divulgación, como las NIIF S1 y S2.");
  });

  it("marks Q17 as not answered when omitted", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    const markdown = buildInterpretationMarkdown({
      id: "id-1",
      createdAt: "2026-10-01T00:00:00.000Z",
      lead: LEAD,
      answers,
      result,
    });
    expect(markdown).toContain("_No fue respondida en este envío._");
  });
});

describe("slugifyCompanyName", () => {
  it("strips accents, lowercases, and hyphenates", () => {
    expect(slugifyCompanyName("Expo Guadalajara")).toBe("expo-guadalajara");
  });

  it("falls back to a generic slug for an empty/unusable name", () => {
    expect(slugifyCompanyName("   ")).toBe("empresa");
  });
});
