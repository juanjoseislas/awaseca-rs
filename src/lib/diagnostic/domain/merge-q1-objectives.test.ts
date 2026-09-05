import { describe, expect, it } from "vitest";
import { Q1_CONCEPTS } from "../config/q1-personalization";
import { buildInput } from "../test-fixtures";
import { calculateDiagnostic } from "./calculate-diagnostic";
import { mergeQ1Objectives } from "./merge-q1-objectives";

describe("mergeQ1Objectives", () => {
  it("TEST 29 — merges two objectives' concepts without duplicates", () => {
    const input = buildInput({}, { q1: ["q1_clients", "q1_ifrs"] });
    const merged = mergeQ1Objectives(input.q1);

    // union of both concept lists, minus semantic duplicates
    const totalSourceConcepts =
      Q1_CONCEPTS.q1_clients.length + Q1_CONCEPTS.q1_ifrs.length;
    expect(merged.length).toBeGreaterThan(0);
    expect(merged.length).toBeLessThan(totalSourceConcepts);

    const normalizedKeys = merged.map((concept) => concept.toLowerCase().split(/\s+/)[0]);
    expect(new Set(normalizedKeys).size).toBe(normalizedKeys.length);
  });

  it("keeps a single objective's concepts unchanged", () => {
    const input = buildInput({}, { q1: ["q1_clients"] });
    expect(mergeQ1Objectives(input.q1)).toEqual(Q1_CONCEPTS.q1_clients);
  });

  it("TEST 29 — selecting 1 vs 2 objectives never changes IPRS or CTA route", () => {
    const single = calculateDiagnostic(buildInput({}, { q1: ["q1_clients"] }));
    const dual = calculateDiagnostic(buildInput({}, { q1: ["q1_clients", "q1_ifrs"] }));

    expect(dual.iprs).toBe(single.iprs);
    expect(dual.finalLevel).toBe(single.finalLevel);
    expect(dual.cta.route).toBe(single.cta.route);
  });
});
