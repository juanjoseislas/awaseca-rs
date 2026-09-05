import { describe, expect, it } from "vitest";
import { CTA_MODIFIERS, CTA_ROUTES } from "./ctas";
import { DISCLAIMER_COPY, Q16_INTERPRETATION, TERMINOLOGY, UNCERTAINTY_COPY } from "./copy";
import { DIMENSIONS, DIMENSION_IDS } from "./dimensions";
import { LEVELS, LEVEL_ORDER } from "./levels";
import { RECOMMENDATION_RULES } from "./recommendations";
import { QUESTIONS, QUESTIONS_BY_ID } from "./questions";

describe("dimension configuration (spec §7, §59)", () => {
  it("has exactly 5 dimensions", () => {
    expect(DIMENSION_IDS).toHaveLength(5);
    expect(Object.keys(DIMENSIONS)).toHaveLength(5);
  });

  it("weights sum to exactly 1", () => {
    const sum = DIMENSION_IDS.reduce((total, id) => total + DIMENSIONS[id].weight, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("D3 is the heaviest dimension at 30%", () => {
    expect(DIMENSIONS.D3.weight).toBe(0.3);
  });

  it("marks exactly D2 and D3 as critical", () => {
    expect(DIMENSIONS.D2.critical).toBe(true);
    expect(DIMENSIONS.D3.critical).toBe(true);
    expect(DIMENSIONS.D1.critical).toBe(false);
    expect(DIMENSIONS.D4.critical).toBe(false);
    expect(DIMENSIONS.D5.critical).toBe(false);
  });
});

describe("level configuration (spec §14, §59)", () => {
  it("has exactly 4 levels", () => {
    expect(LEVELS).toHaveLength(4);
    expect(Object.keys(LEVEL_ORDER)).toHaveLength(4);
  });
});

describe("question configuration (spec §5-9, §59)", () => {
  it("has exactly 17 questions", () => {
    expect(QUESTIONS).toHaveLength(17);
  });

  it("Q1 allows a maximum of 2 selections and is unscored", () => {
    expect(QUESTIONS_BY_ID.q1.maxSelections).toBe(2);
    expect(QUESTIONS_BY_ID.q1.scored).toBe(false);
  });

  it("Q4-Q15 are exactly the 12 scored questions", () => {
    const scored = QUESTIONS.filter((q) => q.scored).map((q) => q.id);
    expect(scored).toEqual([
      "q4",
      "q5",
      "q6",
      "q7",
      "q8",
      "q9",
      "q10",
      "q11",
      "q12",
      "q13",
      "q14",
      "q15",
    ]);
  });

  it("Q16 and Q17 are optional and unscored", () => {
    expect(QUESTIONS_BY_ID.q16.required).toBe(false);
    expect(QUESTIONS_BY_ID.q16.scored).toBe(false);
    expect(QUESTIONS_BY_ID.q17.required).toBe(false);
    expect(QUESTIONS_BY_ID.q17.scored).toBe(false);
  });

  it("has exactly 7 uncertainty:true options, all on Q5-Q11", () => {
    const uncertaintyOptions = QUESTIONS.flatMap((q) =>
      (q.options ?? [])
        .filter((option) => option.uncertainty === true)
        .map((option) => ({ questionId: q.id, optionId: option.id })),
    );
    expect(uncertaintyOptions).toHaveLength(7);
    expect(uncertaintyOptions.every((o) => ["q5", "q6", "q7", "q8", "q9", "q10", "q11"].includes(o.questionId))).toBe(
      true,
    );
  });

  it("Q12 keeps q12_unknown and q12_no_report as distinct options sharing score 1", () => {
    const q12 = QUESTIONS_BY_ID.q12;
    const unknown = q12.options?.find((o) => o.id === "q12_unknown");
    const noReport = q12.options?.find((o) => o.id === "q12_no_report");
    expect(unknown?.score).toBe(1);
    expect(noReport?.score).toBe(1);
    expect(unknown?.id).not.toBe(noReport?.id);
  });

  it("Q15 keeps q15_no and q15_no_report as distinct options sharing score 1", () => {
    const q15 = QUESTIONS_BY_ID.q15;
    const no = q15.options?.find((o) => o.id === "q15_no");
    const noReport = q15.options?.find((o) => o.id === "q15_no_report");
    expect(no?.score).toBe(1);
    expect(noReport?.score).toBe(1);
    expect(no?.id).not.toBe(noReport?.id);
  });

  it.each([
    ["q4", { q4_regular: 4, q4_irregular: 3, q4_once_twice: 2, q4_first: 1 }],
    ["q7", { q7_prioritized: 4, q7_identified: 3, q7_partial: 2, q7_no: 1, q7_unsure: 1 }],
    ["q9", { q9_historical: 4, q9_recent: 3, q9_partial: 2, q9_no: 1, q9_unsure: 1 }],
    ["q12", { q12_structured: 4, q12_partial: 3, q12_other: 2, q12_unknown: 1, q12_no_report: 1 }],
    ["q15", { q15_regular: 4, q15_some: 3, q15_evaluating: 2, q15_no: 1, q15_no_report: 1 }],
  ])("%s option scores match the closed spec exactly", (questionId, expectedScores) => {
    const question = QUESTIONS_BY_ID[questionId];
    for (const [optionId, expectedScore] of Object.entries(expectedScores)) {
      const option = question.options?.find((o) => o.id === optionId);
      expect(option?.score).toBe(expectedScore);
    }
  });
});

describe("recommendation catalog (spec §23-26)", () => {
  it("never has a rule id keyed to Q1 or Q3", () => {
    expect(RECOMMENDATION_RULES.some((rule) => /^R-Q1-|^R-Q1$/.test(rule.id))).toBe(false);
    expect(RECOMMENDATION_RULES.some((rule) => /^R-Q3-|^R-Q3$/.test(rule.id))).toBe(false);
  });

  it("has no rule for q2_other", () => {
    expect(RECOMMENDATION_RULES.some((rule) => rule.id === "R-Q2-OTHER")).toBe(false);
  });
});

describe("terminology (spec §57)", () => {
  it("no config copy string contains a forbidden compliance claim", () => {
    const copySources = [
      UNCERTAINTY_COPY,
      DISCLAIMER_COPY,
      Q16_INTERPRETATION,
      RECOMMENDATION_RULES.map(({ title, description }) => ({ title, description })),
      CTA_ROUTES,
      CTA_MODIFIERS,
    ];
    const haystack = JSON.stringify(copySources).toLowerCase();

    for (const forbidden of TERMINOLOGY.forbidden) {
      expect(haystack).not.toContain(forbidden.toLowerCase());
    }
  });
});
