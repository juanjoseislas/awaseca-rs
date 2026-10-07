import { describe, expect, it } from "vitest";
import { TIER1_OPTIONS, TIER3_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDiagnostic } from "./calculate-diagnostic";
import { generateSalesInsights } from "./generate-sales-insights";

function insightsFor(overrides: Parameters<typeof buildInput>[0], options?: Parameters<typeof buildInput>[1]) {
  const answers = buildInput(overrides, options);
  const result = calculateDiagnostic(answers);
  return generateSalesInsights({ answers, result });
}

describe("generateSalesInsights", () => {
  it("returns no bullets when no condition matches", () => {
    const insights = insightsFor(TIER3_OPTIONS, {
      q1: ["q1_regulatory"],
      q2: "q2_other",
      q3: "q3_training",
    });
    expect(insights).toEqual([]);
  });

  it("flags a critical gap with a framing note, not the whyThisLevel copy", () => {
    const answers = buildInput(TIER1_OPTIONS);
    const result = calculateDiagnostic(answers);
    expect(result.criticalGap).toBe(true);

    const insights = generateSalesInsights({ answers, result });
    expect(insights).toContain(
      "El nivel final quedó limitado por una brecha crítica (ver sección 1). Conviene encuadrar la conversación como 'base sólida con un punto concreto por resolver', no como 'nivel bajo en general'.",
    );
    expect(insights).not.toContain(result.whyThisLevel);
  });

  it("flags when the lead already asked for a specialist", () => {
    const insights = insightsFor(TIER3_OPTIONS, { q2: "q2_other", q3: "q3_specialist" });
    expect(insights).toEqual([
      "La empresa ya seleccionó 'contratar a un especialista' como el apoyo que busca: no es necesario vender el concepto de acompañamiento, solo acordar alcance y siguientes pasos.",
    ]);
  });

  it("flags the NIIF S1/S2 regulatory hook when q1 includes q1_ifrs", () => {
    const insights = insightsFor(TIER3_OPTIONS, {
      q1: ["q1_ifrs"],
      q2: "q2_other",
      q3: "q3_training",
    });
    expect(insights).toEqual([
      "Mencionaron prepararse para NIIF S1/S2 como uno de sus objetivos: es un gancho con urgencia regulatoria que puede ayudar a acelerar la decisión.",
    ]);
  });

  it("wraps the existing Q2 CTA emphasis into a scope note, keyed by the stated obstacle", () => {
    const insights = insightsFor(TIER3_OPTIONS, { q2: "q2_engagement", q3: "q3_training" });
    expect(insights).toEqual([
      "Su obstáculo declarado (coordinación transversal y participación de áreas) sugiere que el alcance de la propuesta debe incluir un componente de coordinación interna, no solo trabajo técnico.",
    ]);
  });

  it("never fires the obstacle-scope note for q2_other — no fabricated emphasis", () => {
    const insights = insightsFor(TIER3_OPTIONS, { q2: "q2_other", q3: "q3_training" });
    expect(insights).toEqual([]);
  });

  it("flags partial integration (Q16) as a meeting follow-up question", () => {
    const withoutQ16 = insightsFor(TIER3_OPTIONS, { q2: "q2_other", q3: "q3_training" });
    expect(withoutQ16).toEqual([]);

    const withQ16 = insightsFor(TIER3_OPTIONS, {
      q2: "q2_other",
      q3: "q3_training",
      q16: "q16_partial",
    });
    expect(withQ16).toEqual([
      "Dijeron que la información de sostenibilidad se integra 'parcialmente' con otros procesos de gestión: vale la pena preguntar en la reunión qué procesos ya están conectados y cuáles faltan.",
    ]);
  });

  it("returns multiple bullets at once when several conditions match (Expo Guadalajara-style case)", () => {
    const answers = buildInput(TIER3_OPTIONS, {
      q1: ["q1_management", "q1_ifrs"],
      q2: "q2_engagement",
      q3: "q3_specialist",
      q16: "q16_partial",
    });
    const result = calculateDiagnostic(answers);
    const insights = generateSalesInsights({ answers, result });

    expect(insights.length).toBeGreaterThanOrEqual(4);
    expect(insights).toEqual(
      expect.arrayContaining([
        expect.stringContaining("especialista"),
        expect.stringContaining("NIIF"),
        expect.stringContaining("coordinación transversal"),
        expect.stringContaining("parcialmente"),
      ]),
    );
  });
});
