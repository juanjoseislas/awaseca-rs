import { describe, expect, it } from "vitest";
import { TIER1_OPTIONS, TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDiagnostic } from "./calculate-diagnostic";

describe("calculateDiagnostic", () => {
  it("TEST 1 — all-minimum answers produce the fully-Inicial result", () => {
    const result = calculateDiagnostic(buildInput(TIER1_OPTIONS));
    expect(result.dimensions.D1.score).toBe(0);
    expect(result.dimensions.D2.score).toBe(0);
    expect(result.dimensions.D3.score).toBe(0);
    expect(result.dimensions.D4.score).toBe(0);
    expect(result.dimensions.D5.score).toBe(0);
    expect(result.iprs).toBe(0);
    expect(result.calculatedLevel).toBe("Inicial");
    expect(result.finalLevel).toBe("Inicial");
  });

  it("TEST 2 — all-maximum answers produce the fully-Avanzada result", () => {
    const result = calculateDiagnostic(buildInput(TIER4_OPTIONS));
    for (const id of ["D1", "D2", "D3", "D4", "D5"] as const) {
      expect(result.dimensions[id].score).toBe(100);
    }
    expect(result.iprs).toBe(100);
    expect(result.calculatedLevel).toBe("Avanzada");
    expect(result.finalLevel).toBe("Avanzada");
    expect(result.methodologyVersion).toBe("1.0");
  });

  it("TEST 30 — omitting the optional Q16 does not change any other output", () => {
    const withQ16 = calculateDiagnostic(buildInput({}, { q16: "q16_integrated" }));
    const withoutQ16 = calculateDiagnostic(buildInput({}));
    expect(withQ16).toEqual(withoutQ16);
  });

  it("TEST 31 — Q17 free text never affects any engine output", () => {
    const base = calculateDiagnostic(buildInput({}, { q17: undefined }));
    const withText = calculateDiagnostic(buildInput({}, { q17: "Contexto adicional relevante." }));
    const withEmpty = calculateDiagnostic(buildInput({}, { q17: "" }));

    expect(withText).toEqual(base);
    expect(withEmpty).toEqual(base);
  });

  it("matches the spec §44 result shape", () => {
    const result = calculateDiagnostic(buildInput({}));
    expect(Object.keys(result).sort()).toEqual(
      [
        "methodologyVersion",
        "iprs",
        "displayIprs",
        "calculatedLevel",
        "finalLevel",
        "criticalGap",
        "criticalGapDimensions",
        "uncertainAnswers",
        "uncertaintyRate",
        "uncertaintyFlag",
        "dimensions",
        "strengths",
        "gaps",
        "gapsScenario",
        "recommendations",
        "cta",
      ].sort(),
    );
  });

  it("displayIprs floors without ever crossing a level boundary the decimal hasn't crossed", () => {
    const result = calculateDiagnostic(buildInput({}));
    expect(result.displayIprs).toBe(Math.floor(result.iprs));
  });

  it("is a pure function: same input always produces the same output", () => {
    const input = buildInput({});
    expect(calculateDiagnostic(input)).toEqual(calculateDiagnostic(input));
  });

  it("throws on invalid input rather than silently computing a wrong result", () => {
    const input = buildInput({});
    input.q1 = [];
    expect(() => calculateDiagnostic(input)).toThrow();
  });
});
