import { describe, expect, it } from "vitest";
import { WHY_LEVEL_COPY } from "../config/levels";
import { TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDiagnostic } from "./calculate-diagnostic";

describe("resolveWhyThisLevel (approved adjustments doc §1/§13, 2026-09-07)", () => {
  it("TEST 1 — calculatedLevel === finalLevel produces no explanation", () => {
    const result = calculateDiagnostic(buildInput(TIER4_OPTIONS));
    expect(result.calculatedLevel).toBe(result.finalLevel);
    expect(result.whyThisLevel).toBeNull();
  });

  it("TEST 2 — D2 < 40 critical gap shows the materiality explanation", () => {
    const result = calculateDiagnostic(buildInput({ ...TIER4_OPTIONS, q7: "q7_no", q8: "q8_no" }));
    expect(result.calculatedLevel).not.toBe(result.finalLevel);
    expect(result.whyThisLevel).toBe(WHY_LEVEL_COPY.d2Critical);
  });

  it("TEST 3 — D3 < 40 critical gap shows the data/traceability explanation", () => {
    const result = calculateDiagnostic(
      buildInput({ ...TIER4_OPTIONS, q9: "q9_no", q10: "q10_no", q11: "q11_no" }),
    );
    expect(result.calculatedLevel).not.toBe(result.finalLevel);
    expect(result.whyThisLevel).toBe(WHY_LEVEL_COPY.d3Critical);
  });

  it("TEST 4 — D2 and D3 both < 40 shows the combined explanation, not a concatenation", () => {
    const result = calculateDiagnostic(
      buildInput({
        ...TIER4_OPTIONS,
        q7: "q7_no",
        q8: "q8_no",
        q9: "q9_no",
        q10: "q10_no",
        q11: "q11_no",
      }),
    );
    expect(result.whyThisLevel).toBe(WHY_LEVEL_COPY.bothCritical);
    expect(result.whyThisLevel).not.toBe(WHY_LEVEL_COPY.d2Critical);
    expect(result.whyThisLevel).not.toBe(WHY_LEVEL_COPY.d3Critical);
  });

  it("TEST 5 — Avanzada calculated, Preparada final shows the balance explanation", () => {
    const result = calculateDiagnostic(
      buildInput({ ...TIER4_OPTIONS, q4: "q4_first", q5: "q5_no", q6: "q6_no" }),
    );
    expect(result.calculatedLevel).toBe("Avanzada");
    expect(result.finalLevel).toBe("Preparada");
    expect(result.whyThisLevel).toBe(WHY_LEVEL_COPY.avanzadaToPreparada);
  });
});
