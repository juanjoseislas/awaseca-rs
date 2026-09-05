import { describe, expect, it } from "vitest";
import { TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDimensions } from "./calculate-dimensions";
import { selectGaps } from "./select-gaps";

describe("selectGaps", () => {
  it("TEST 17 Case A — D2/D3 < 40 ranks above another <40 dimension with a lower raw score", () => {
    // D1 = 0 (lowest raw score), D2 ≈ 16.67 (< 40 but higher raw score than D1).
    // D2 must still rank first because D2/D3 < 40 carries special priority (spec §22).
    const dimensions = calculateDimensions(
      buildInput({
        ...TIER4_OPTIONS,
        q4: "q4_first",
        q5: "q5_no",
        q6: "q6_no",
        q7: "q7_no",
        q8: "q8_updating",
      }),
    );
    expect(dimensions.D1.score).toBe(0);
    expect(dimensions.D2.score).toBeGreaterThan(0);
    expect(dimensions.D2.score).toBeLessThan(40);
    for (const id of ["D3", "D4", "D5"] as const) {
      expect(dimensions[id].score).toBeGreaterThanOrEqual(70);
    }

    const { gaps, scenario } = selectGaps(dimensions);
    expect(scenario).toBe("gaps");
    expect(gaps).toHaveLength(2);
    expect(gaps.map((gap) => gap.dimensionId)).toEqual(["D2", "D1"]);
    expect(gaps[0].classification).toBe("Brecha crítica");
  });

  it("TEST 17 Case B — no gaps labeled when every dimension is >= 70", () => {
    const dimensions = calculateDimensions(buildInput(TIER4_OPTIONS));
    const { gaps, scenario } = selectGaps(dimensions);
    expect(scenario).toBe("consolidation-opportunities");
    expect(gaps).toHaveLength(2);
    for (const gap of gaps) {
      expect(gap.isOpportunity).toBe(true);
      expect(gap.classification).not.toMatch(/Brecha/);
    }
  });

  it("returns only the eligible dimensions when just one is < 70", () => {
    const dimensions = calculateDimensions(
      buildInput({ ...TIER4_OPTIONS, q7: "q7_no", q8: "q8_no" }),
    );
    const { gaps, scenario } = selectGaps(dimensions);
    expect(scenario).toBe("gaps");
    expect(gaps).toHaveLength(1);
    expect(gaps[0].dimensionId).toBe("D2");
  });
});
