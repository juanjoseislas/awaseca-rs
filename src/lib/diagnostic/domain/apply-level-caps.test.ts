import { describe, expect, it } from "vitest";
import { TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { applyLevelCaps } from "./apply-level-caps";
import { calculateCriticalGaps } from "./calculate-critical-gaps";
import { calculateDimensions } from "./calculate-dimensions";
import { calculateIPRS } from "./calculate-iprs";
import { getCalculatedLevel } from "./calculate-level";

function runFullPipeline(overrides: Record<string, string>) {
  const dimensions = calculateDimensions(buildInput(overrides));
  const iprs = calculateIPRS(dimensions);
  const calculatedLevel = getCalculatedLevel(iprs);
  const { criticalGapDimensions } = calculateCriticalGaps(dimensions);
  const finalLevel = applyLevelCaps(calculatedLevel, iprs, dimensions, criticalGapDimensions);
  return { dimensions, iprs, calculatedLevel, finalLevel, criticalGapDimensions };
}

describe("applyLevelCaps", () => {
  it("TEST 7 — D2 < 40 caps finalLevel at 'En desarrollo' when IPRS >= 50", () => {
    const { iprs, calculatedLevel, finalLevel } = runFullPipeline({
      ...TIER4_OPTIONS,
      q7: "q7_no",
      q8: "q8_no",
    });
    expect(iprs).toBeGreaterThanOrEqual(50);
    expect(["Preparada", "Avanzada"]).toContain(calculatedLevel);
    expect(finalLevel).toBe("En desarrollo");
  });

  it("TEST 8 — D3 < 40 caps finalLevel at 'En desarrollo' when IPRS >= 50", () => {
    const { iprs, calculatedLevel, finalLevel } = runFullPipeline({
      ...TIER4_OPTIONS,
      q9: "q9_no",
      q10: "q10_no",
      q11: "q11_no",
    });
    expect(iprs).toBeGreaterThanOrEqual(50);
    expect(["Preparada", "Avanzada"]).toContain(calculatedLevel);
    expect(finalLevel).toBe("En desarrollo");
  });

  it("TEST 9 — D2 and D3 both < 40 caps finalLevel at 'En desarrollo'", () => {
    const { iprs, calculatedLevel, finalLevel, criticalGapDimensions } = runFullPipeline({
      ...TIER4_OPTIONS,
      q7: "q7_no",
      q8: "q8_no",
      q9: "q9_no",
      q10: "q10_no",
      q11: "q11_no",
    });
    expect(iprs).toBeGreaterThanOrEqual(50);
    expect(calculatedLevel).toBe("Preparada");
    expect(finalLevel).toBe("En desarrollo");
    expect(criticalGapDimensions).toEqual(["D2", "D3"]);
  });

  it("TEST 10 — Avanzada IPRS with one dimension < 60 caps finalLevel at 'Preparada'", () => {
    const { iprs, calculatedLevel, finalLevel } = runFullPipeline({
      ...TIER4_OPTIONS,
      q4: "q4_first",
      q5: "q5_no",
      q6: "q6_no",
    });
    expect(iprs).toBeGreaterThanOrEqual(75);
    expect(calculatedLevel).toBe("Avanzada");
    expect(finalLevel).toBe("Preparada");
  });

  it("never raises a level above what was calculated", () => {
    const { calculatedLevel, finalLevel } = runFullPipeline(TIER4_OPTIONS);
    expect(calculatedLevel).toBe("Avanzada");
    expect(finalLevel).toBe("Avanzada");
  });
});
