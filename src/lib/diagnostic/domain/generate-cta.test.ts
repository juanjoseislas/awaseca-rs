import { describe, expect, it } from "vitest";
import { CTA_GAP_OVERRIDES, CTA_MODIFIERS, CTA_ROUTES } from "../config/ctas";
import { TIER4_OPTIONS, buildInput } from "../test-fixtures";
import { calculateCriticalGaps } from "./calculate-critical-gaps";
import { calculateDimensions } from "./calculate-dimensions";
import { calculateIPRS } from "./calculate-iprs";
import { applyLevelCaps } from "./apply-level-caps";
import { getCalculatedLevel } from "./calculate-level";
import { generateCTA } from "./generate-cta";
import { selectGaps } from "./select-gaps";

function ctaFor(overrides: Record<string, string>, q3: string) {
  const input = buildInput(overrides, { q3 });
  const dimensions = calculateDimensions(input);
  const iprs = calculateIPRS(dimensions);
  const calculatedLevel = getCalculatedLevel(iprs);
  const { criticalGapDimensions } = calculateCriticalGaps(dimensions);
  const finalLevel = applyLevelCaps(calculatedLevel, iprs, dimensions, criticalGapDimensions);
  const hasGaps = selectGaps(dimensions).scenario === "gaps";
  return generateCTA({ answers: input, dimensions, finalLevel, hasGaps });
}

/**
 * Builds one fixed (answers, dimensions, finalLevel) context for a route and
 * calls generateCTA with an explicit hasGaps override on each side, so the
 * two calls differ ONLY in hasGaps — isolating the gap-variant copy from
 * the tone/emphasis suffix, which vary with finalLevel/Q1/Q2, not hasGaps.
 */
function ctaVariants(overrides: Record<string, string>, q3: string) {
  const input = buildInput(overrides, { q3 });
  const dimensions = calculateDimensions(input);
  const iprs = calculateIPRS(dimensions);
  const calculatedLevel = getCalculatedLevel(iprs);
  const { criticalGapDimensions } = calculateCriticalGaps(dimensions);
  const finalLevel = applyLevelCaps(calculatedLevel, iprs, dimensions, criticalGapDimensions);
  return {
    withGaps: generateCTA({ answers: input, dimensions, finalLevel, hasGaps: true }),
    withoutGaps: generateCTA({ answers: input, dimensions, finalLevel, hasGaps: false }),
  };
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

  describe("hasGaps copy variants (approved adjustments doc §3-8, 2026-09-07)", () => {
    it("TEST 32 — hasGaps true uses the 'con brechas' variant (the CTA_ROUTES default)", () => {
      const { withGaps } = ctaVariants({}, "q3_training");
      expect(withGaps.body.startsWith(CTA_ROUTES.training.body)).toBe(true);
    });

    it("TEST 33 — hasGaps false never mentions gaps for training/consulting/diagnostic-review", () => {
      for (const q3 of ["q3_training", "q3_consulting", "q3_unsure"]) {
        const { withoutGaps } = ctaVariants({}, q3);
        expect(withoutGaps.title.toLowerCase()).not.toContain("brecha");
        expect(withoutGaps.body.toLowerCase()).not.toContain("brecha");
      }
    });

    it("TEST 34 — training/consulting keep their title/button fixed across hasGaps", () => {
      const { withGaps, withoutGaps } = ctaVariants({}, "q3_training");
      expect(withGaps.title).toBe(CTA_ROUTES.training.title);
      expect(withoutGaps.title).toBe(CTA_ROUTES.training.title);
      expect(withGaps.buttonLabel).toBe(withoutGaps.buttonLabel);
      expect(withGaps.body.startsWith(CTA_ROUTES.training.body)).toBe(true);
      expect(withoutGaps.body.startsWith(CTA_GAP_OVERRIDES.training?.body ?? "\0")).toBe(true);
    });

    it("TEST 35 — review only swaps its title by hasGaps, body/button stay fixed", () => {
      const { withGaps, withoutGaps } = ctaVariants({ q4: "q4_irregular" }, "q3_review");
      expect(withGaps.title).toBe(CTA_ROUTES.review.title);
      expect(withoutGaps.title).toBe(CTA_GAP_OVERRIDES.review?.title);
      expect(withGaps.title).not.toBe(withoutGaps.title);
      expect(withGaps.body).toBe(withoutGaps.body);
      expect(withGaps.buttonLabel).toBe(withoutGaps.buttonLabel);
    });

    it("TEST 36 — diagnostic-review swaps both title and body by hasGaps", () => {
      const { withGaps, withoutGaps } = ctaVariants({}, "q3_unsure");
      expect(withGaps.title).toBe(CTA_ROUTES["diagnostic-review"].title);
      expect(withoutGaps.title).toBe(CTA_GAP_OVERRIDES["diagnostic-review"]?.title);
      expect(withGaps.body.startsWith(CTA_ROUTES["diagnostic-review"].body)).toBe(true);
      expect(withoutGaps.body.startsWith(CTA_GAP_OVERRIDES["diagnostic-review"]?.body ?? "\0")).toBe(
        true,
      );
      expect(withGaps.buttonLabel).toBe(withoutGaps.buttonLabel);
    });

    it("TEST 37 — specialist is identical regardless of hasGaps", () => {
      const { withGaps, withoutGaps } = ctaVariants({}, "q3_specialist");
      expect(withGaps).toEqual(withoutGaps);
      expect(withGaps.title).toBe(CTA_ROUTES.specialist.title);
      expect(withGaps.body.startsWith(CTA_ROUTES.specialist.body)).toBe(true);
    });
  });

  it("keeps 'Próximo paso sugerido' out of body, in its own nextStep field", () => {
    const cta = ctaFor({}, "q3_training");
    expect(cta.body).not.toContain("Próximo paso sugerido");
    expect(cta.nextStep).toContain("Próximo paso sugerido:");
  });
});
