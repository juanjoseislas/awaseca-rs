import { describe, expect, it } from "vitest";
import { buildInput } from "../test-fixtures";
import { calculateUncertainty } from "./calculate-uncertainty";

describe("calculateUncertainty", () => {
  it("TEST 11 — 3 uncertain answers trigger the flag", () => {
    const result = calculateUncertainty(
      buildInput({ q5: "q5_unsure", q6: "q6_unsure", q7: "q7_unsure" }),
    );
    expect(result.uncertainAnswers).toBe(3);
    expect(result.uncertaintyRate).toBeCloseTo(0.25, 5);
    expect(result.uncertaintyFlag).toBe(true);
  });

  it("TEST 12 — 2 uncertain answers do not trigger the flag", () => {
    const result = calculateUncertainty(buildInput({ q5: "q5_unsure", q6: "q6_unsure" }));
    expect(result.uncertainAnswers).toBe(2);
    expect(result.uncertaintyRate).toBeCloseTo(2 / 12, 5);
    expect(result.uncertaintyFlag).toBe(false);
  });

  it("never counts a plain score-1 answer as uncertainty", () => {
    // q4_first scores 1 but has no uncertainty option at all
    const result = calculateUncertainty(buildInput({ q4: "q4_first" }));
    expect(result.uncertainAnswers).toBe(0);
  });

  it("counts 0 when no uncertainty option is selected", () => {
    const result = calculateUncertainty(buildInput({}));
    expect(result.uncertainAnswers).toBe(0);
    expect(result.uncertaintyFlag).toBe(false);
  });
});
