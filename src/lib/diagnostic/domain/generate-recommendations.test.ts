import { describe, expect, it } from "vitest";
import { RECOMMENDATION_RULES } from "../config/recommendations";
import { TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateDimensions } from "./calculate-dimensions";
import { generateRecommendations } from "./generate-recommendations";

function idsFor(overrides: Record<string, string>, q2?: string) {
  const input = buildInput(overrides, { q2 });
  const dimensions = calculateDimensions(input);
  return generateRecommendations({ answers: input, dimensions }).map((r) => r.id);
}

describe("generateRecommendations", () => {
  it("TEST 18 — q12_no_report never triggers the GRI-unknown recommendation", () => {
    const ids = idsFor({ ...TIER4_OPTIONS, q12: "q12_no_report", q13: "q13_advancing" });
    expect(ids).not.toContain("R-Q12-UNKNOWN-GRI");
  });

  it("TEST 18 — q12_unknown does trigger it when priority allows", () => {
    const ids = idsFor({ ...TIER4_OPTIONS, q12: "q12_unknown", q13: "q13_advancing" });
    expect(ids).toContain("R-Q12-UNKNOWN-GRI");
  });

  it("TEST 19 — q15_no_report never triggers the assurance recommendation", () => {
    const ids = idsFor({
      ...TIER4_OPTIONS,
      q4: "q4_irregular",
      q14: "q14_systematic",
      q15: "q15_no_report",
    });
    expect(ids).not.toContain("R-Q15");
  });

  it("TEST 19 — q15_no with a prior report can trigger it", () => {
    const ids = idsFor({
      ...TIER4_OPTIONS,
      q4: "q4_irregular",
      q14: "q14_systematic",
      q15: "q15_no",
    });
    expect(ids).toContain("R-Q15");
  });

  it("TEST 19 — q15_no never triggers it when q4 is q4_first", () => {
    const ids = idsFor({
      ...TIER4_OPTIONS,
      q4: "q4_first",
      q14: "q14_systematic",
      q15: "q15_no",
    });
    expect(ids).not.toContain("R-Q15");
  });

  it("puts a D2-critical recommendation first when D2 < 40", () => {
    const ids = idsFor({ ...TIER4_OPTIONS, q7: "q7_no", q8: "q8_no" });
    expect(ids[0]).toBe("R-D2-CRITICAL");
  });

  it("never returns more than 3 recommendations", () => {
    const input = buildInput({});
    const dimensions = calculateDimensions(input);
    const recommendations = generateRecommendations({ answers: input, dimensions });
    expect(recommendations.length).toBeLessThanOrEqual(3);
  });

  it("never returns two recommendations from the same deduplication group", () => {
    const input = buildInput({});
    const dimensions = calculateDimensions(input);
    const recommendations = generateRecommendations({ answers: input, dimensions });
    const groups = recommendations
      .map((r) => RECOMMENDATION_RULES.find((rule) => rule.id === r.id)?.deduplicationGroup)
      .filter((group): group is string => Boolean(group));
    expect(new Set(groups).size).toBe(groups.length);
  });

  it("never includes a rule keyed to Q1 or Q3", () => {
    const catalogQuestionIds = RECOMMENDATION_RULES.map((rule) => rule.id);
    expect(catalogQuestionIds.some((id) => id.startsWith("R-Q1-"))).toBe(false);
    expect(catalogQuestionIds.some((id) => id.startsWith("R-Q3-"))).toBe(false);
  });
});
