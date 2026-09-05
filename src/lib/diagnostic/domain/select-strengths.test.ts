import { describe, expect, it } from "vitest";
import { TIER1_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDimensions } from "./calculate-dimensions";
import { selectStrengths } from "./select-strengths";

describe("selectStrengths", () => {
  it("TEST 14 — returns only the 2 highest when all 5 dimensions qualify", () => {
    const dimensions = calculateDimensions(
      buildInput({
        q4: "q4_regular",
        q5: "q5_documented",
        q6: "q6_tracking",
        q7: "q7_prioritized",
        q8: "q8_updated",
        q9: "q9_historical",
        q10: "q10_formal",
        q11: "q11_majority",
        q12: "q12_structured",
        q13: "q13_evaluated",
        q14: "q14_systematic",
        q15: "q15_some",
      }),
    );
    for (const id of ["D1", "D2", "D3", "D4", "D5"] as const) {
      expect(dimensions[id].score).toBeGreaterThanOrEqual(70);
    }
    const strengths = selectStrengths(dimensions);
    expect(strengths).toHaveLength(2);
    expect(strengths.map((s) => s.dimensionId)).toEqual(["D1", "D3"]);
  });

  it("TEST 15 — returns exactly one when only one dimension qualifies", () => {
    const dimensions = calculateDimensions(
      buildInput({ ...TIER1_OPTIONS, q9: "q9_historical", q10: "q10_formal", q11: "q11_systematic" }),
    );
    expect(dimensions.D3.score).toBeGreaterThanOrEqual(70);
    for (const id of ["D1", "D2", "D4", "D5"] as const) {
      expect(dimensions[id].score).toBeLessThan(70);
    }
    const strengths = selectStrengths(dimensions);
    expect(strengths).toHaveLength(1);
    expect(strengths[0].dimensionId).toBe("D3");
  });

  it("TEST 16 — returns an empty list when no dimension qualifies", () => {
    const dimensions = calculateDimensions(buildInput(TIER1_OPTIONS));
    expect(selectStrengths(dimensions)).toHaveLength(0);
  });

  it("never includes an 'Área por fortalecer' (60-69) dimension as a strength", () => {
    const dimensions = calculateDimensions(
      // D3 tuned to land in [60, 70): q9_historical(4)+q10_informal(3)+q11_some(2)=9 -> (9-3)/9*100=66.67
      buildInput({ ...TIER1_OPTIONS, q9: "q9_historical", q10: "q10_informal", q11: "q11_some" }),
    );
    expect(dimensions.D3.score).toBeGreaterThanOrEqual(60);
    expect(dimensions.D3.score).toBeLessThan(70);
    expect(selectStrengths(dimensions).map((s) => s.dimensionId)).not.toContain("D3");
  });
});
