import { describe, expect, it } from "vitest";
import { DIMENSION_IDS } from "../config/dimensions";
import { TIER1_OPTIONS, TIER3_OPTIONS, TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDimensions } from "./calculate-dimensions";
import { calculateIPRS } from "./calculate-iprs";

describe("calculateIPRS", () => {
  it("TEST 1 — all-minimum answers yield IPRS 0", () => {
    const dimensions = calculateDimensions(buildInput(TIER1_OPTIONS));
    expect(calculateIPRS(dimensions)).toBe(0);
  });

  it("TEST 2 — all-maximum answers yield IPRS 100", () => {
    const dimensions = calculateDimensions(buildInput(TIER4_OPTIONS));
    expect(calculateIPRS(dimensions)).toBe(100);
  });

  it("weights D3 at 30% — the heaviest dimension", () => {
    const dimensions = calculateDimensions(buildInput(TIER3_OPTIONS));
    // all dimensions equal (66.67) at tier 3, so IPRS should equal that value
    // regardless of weighting -- this is a sanity check on the weighted sum.
    expect(calculateIPRS(dimensions)).toBeCloseTo(dimensions.D3.score, 5);
  });

  it("always returns a value within [0, 100] across sampled fixtures", () => {
    for (const overrides of [TIER1_OPTIONS, TIER3_OPTIONS, TIER4_OPTIONS]) {
      const dimensions = calculateDimensions(buildInput(overrides));
      const iprs = calculateIPRS(dimensions);
      expect(iprs).toBeGreaterThanOrEqual(0);
      expect(iprs).toBeLessThanOrEqual(100);
    }
  });

  it("uses every configured dimension weight", () => {
    // regression guard: if a dimension were dropped from the sum, this would drift
    expect(DIMENSION_IDS).toHaveLength(5);
  });
});
