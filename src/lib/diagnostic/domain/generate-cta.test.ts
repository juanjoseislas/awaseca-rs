import { describe, expect, it } from "vitest";
import { CTA_MODIFIERS, CTA_ROUTES } from "../config/ctas";
import { TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateCriticalGaps } from "./calculate-critical-gaps";
import { calculateDimensions } from "./calculate-dimensions";
import { calculateIPRS } from "./calculate-iprs";
import { applyLevelCaps } from "./apply-level-caps";
import { getCalculatedLevel } from "./calculate-level";
import { generateCTA } from "./generate-cta";

function ctaFor(overrides: Record<string, string>, q3: string) {
  const input = buildInput(overrides, { q3 });
  const dimensions = calculateDimensions(input);
  const iprs = calculateIPRS(dimensions);
  const calculatedLevel = getCalculatedLevel(iprs);
  const { criticalGapDimensions } = calculateCriticalGaps(dimensions);
  const finalLevel = applyLevelCaps(calculatedLevel, iprs, dimensions, criticalGapDimensions);
  return generateCTA({ answers: input, dimensions, finalLevel });
}

describe("generateCTA", () => {
  it("TEST 20 — q3_training routes to training", () => {
    expect(ctaFor({}, "q3_training").route).toBe("training");
  });

  it("TEST 21 — q3_consulting routes to consulting", () => {
    expect(ctaFor({}, "q3_consulting").route).toBe("consulting");
  });

  it("TEST 22 — q3_specialist routes to specialist", () => {
    expect(ctaFor({}, "q3_specialist").route).toBe("specialist");
  });

  it("TEST 23 Case A — q3_review with a prior report routes to review", () => {
    const cta = ctaFor({ q4: "q4_irregular" }, "q3_review");
    expect(cta.route).toBe("review");
    expect(cta.buttonLabel).toBe(CTA_ROUTES.review.buttonLabel);
  });

  it("TEST 23 Case B — q3_review + q4_first redirects to diagnostic-review", () => {
    const cta = ctaFor({ q4: "q4_first" }, "q3_review");
    expect(cta.route).toBe("diagnostic-review");
    expect(cta.buttonLabel).toBe(CTA_ROUTES["diagnostic-review"].buttonLabel);
    expect(cta.buttonLabel).not.toBe(CTA_ROUTES.review.buttonLabel);
  });

  it("TEST 24 — q3_unsure routes to diagnostic-review", () => {
    expect(ctaFor({}, "q3_unsure").route).toBe("diagnostic-review");
  });

  it("TEST 25 — D2 < 40, D3 >= 40 uses the materiality modifier", () => {
    const cta = ctaFor({ ...TIER4_OPTIONS, q7: "q7_no", q8: "q8_no" }, "q3_training");
    expect(cta.modifier).toBe(CTA_MODIFIERS.d2Only);
  });

  it("TEST 26 — D3 < 40, D2 >= 40 uses the data/traceability modifier", () => {
    const cta = ctaFor(
      { ...TIER4_OPTIONS, q9: "q9_no", q10: "q10_no", q11: "q11_no" },
      "q3_training",
    );
    expect(cta.modifier).toBe(CTA_MODIFIERS.d3Only);
  });

  it("TEST 27 — D2 and D3 both < 40 uses the combined modifier, not a concatenation", () => {
    const cta = ctaFor(
      {
        ...TIER4_OPTIONS,
        q7: "q7_no",
        q8: "q8_no",
        q9: "q9_no",
        q10: "q10_no",
        q11: "q11_no",
      },
      "q3_training",
    );
    expect(cta.modifier).toBe(CTA_MODIFIERS.both);
    expect(cta.modifier).not.toBe(CTA_MODIFIERS.d2Only);
    expect(cta.modifier).not.toBe(CTA_MODIFIERS.d3Only);
    expect(cta.modifier).not.toContain(CTA_MODIFIERS.d2Only);
    expect(cta.modifier).not.toContain(CTA_MODIFIERS.d3Only);
  });

  it("never modifies the CTA route based on D2/D3 gaps", () => {
    const withGap = ctaFor({ ...TIER4_OPTIONS, q7: "q7_no", q8: "q8_no" }, "q3_consulting");
    const withoutGap = ctaFor(TIER4_OPTIONS, "q3_consulting");
    expect(withGap.route).toBe(withoutGap.route);
  });
});
