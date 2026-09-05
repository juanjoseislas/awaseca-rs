import { describe, expect, it } from "vitest";
import { normalizeDimension } from "./normalize-dimension";

describe("normalizeDimension", () => {
  it("returns 0 at the minimum", () => {
    expect(normalizeDimension(3, 3, 12)).toBe(0);
  });

  it("returns 100 at the maximum", () => {
    expect(normalizeDimension(12, 3, 12)).toBe(100);
  });

  it("scales linearly between bounds", () => {
    expect(normalizeDimension(6, 3, 12)).toBeCloseTo(33.333, 2);
    expect(normalizeDimension(9, 3, 12)).toBeCloseTo(66.667, 2);
  });

  it("handles 2-question dimension bounds", () => {
    expect(normalizeDimension(2, 2, 8)).toBe(0);
    expect(normalizeDimension(8, 2, 8)).toBe(100);
    expect(normalizeDimension(5, 2, 8)).toBeCloseTo(50, 5);
  });
});
