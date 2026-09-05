import { describe, expect, it } from "vitest";
import { TIER1_OPTIONS, TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDimensions } from "./calculate-dimensions";

describe("calculateDimensions", () => {
  it("TEST 1 — all tier-1 answers yield every dimension at 0", () => {
    const dimensions = calculateDimensions(buildInput(TIER1_OPTIONS));
    for (const id of ["D1", "D2", "D3", "D4", "D5"] as const) {
      expect(dimensions[id].score).toBe(0);
      expect(dimensions[id].classification).toBe("Brecha crítica");
    }
  });

  it("TEST 2 — all tier-4 answers yield every dimension at 100", () => {
    const dimensions = calculateDimensions(buildInput(TIER4_OPTIONS));
    for (const id of ["D1", "D2", "D3", "D4", "D5"] as const) {
      expect(dimensions[id].score).toBe(100);
      expect(dimensions[id].classification).toBe("Fortaleza consolidada");
    }
  });

  it("flags D2 and D3 as critical regardless of score", () => {
    const dimensions = calculateDimensions(buildInput(TIER1_OPTIONS));
    expect(dimensions.D2.critical).toBe(true);
    expect(dimensions.D3.critical).toBe(true);
    expect(dimensions.D1.critical).toBe(false);
    expect(dimensions.D4.critical).toBe(false);
    expect(dimensions.D5.critical).toBe(false);
  });

  it("re-derives scores from config, ignoring a tampered Answer.score", () => {
    const input = buildInput(TIER1_OPTIONS);
    input.q4 = { ...input.q4, score: 999 };
    const dimensions = calculateDimensions(input);
    expect(dimensions.D1.score).toBe(0);
  });
});
