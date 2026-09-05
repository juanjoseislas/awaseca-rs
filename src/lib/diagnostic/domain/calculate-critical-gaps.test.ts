import { describe, expect, it } from "vitest";
import { buildInput, TIER4_OPTIONS } from "../test-fixtures";
import { calculateCriticalGaps } from "./calculate-critical-gaps";
import { calculateDimensions } from "./calculate-dimensions";

describe("calculateCriticalGaps", () => {
  it("flags D2 alone when only D2 < 40", () => {
    const dimensions = calculateDimensions(
      buildInput({ ...TIER4_OPTIONS, q7: "q7_no", q8: "q8_no" }),
    );
    expect(dimensions.D2.score).toBeLessThan(40);
    const result = calculateCriticalGaps(dimensions);
    expect(result).toEqual({ criticalGap: true, criticalGapDimensions: ["D2"] });
  });

  it("flags D3 alone when only D3 < 40", () => {
    const dimensions = calculateDimensions(
      buildInput({ ...TIER4_OPTIONS, q9: "q9_no", q10: "q10_no", q11: "q11_no" }),
    );
    expect(dimensions.D3.score).toBeLessThan(40);
    const result = calculateCriticalGaps(dimensions);
    expect(result).toEqual({ criticalGap: true, criticalGapDimensions: ["D3"] });
  });

  it("flags both D2 and D3, in that order, when both < 40", () => {
    const dimensions = calculateDimensions(
      buildInput({
        ...TIER4_OPTIONS,
        q7: "q7_no",
        q8: "q8_no",
        q9: "q9_no",
        q10: "q10_no",
        q11: "q11_no",
      }),
    );
    const result = calculateCriticalGaps(dimensions);
    expect(result).toEqual({ criticalGap: true, criticalGapDimensions: ["D2", "D3"] });
  });

  it("reports no critical gap when D2 and D3 are both >= 40", () => {
    const dimensions = calculateDimensions(buildInput(TIER4_OPTIONS));
    expect(calculateCriticalGaps(dimensions)).toEqual({
      criticalGap: false,
      criticalGapDimensions: [],
    });
  });
});
