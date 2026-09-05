import { describe, expect, it } from "vitest";
import {
  TIER1_OPTIONS,
  TIER2_OPTIONS,
  TIER3_OPTIONS,
  TIER4_OPTIONS,
  buildInput,
} from "../test-fixtures";
import { calculateDimensions } from "./calculate-dimensions";
import { calculateIPRS } from "./calculate-iprs";
import { capLevel, getCalculatedLevel } from "./calculate-level";

function levelFor(overrides: Record<string, string>) {
  const dimensions = calculateDimensions(buildInput(overrides));
  return getCalculatedLevel(calculateIPRS(dimensions));
}

describe("getCalculatedLevel", () => {
  it("TEST 3 — Inicial when IPRS < 25", () => {
    expect(levelFor(TIER1_OPTIONS)).toBe("Inicial");
  });

  it("TEST 4 — En desarrollo when 25 <= IPRS < 50", () => {
    expect(levelFor(TIER2_OPTIONS)).toBe("En desarrollo");
  });

  it("TEST 5 — Preparada when 50 <= IPRS < 75, with D2/D3 >= 40", () => {
    const dimensions = calculateDimensions(buildInput(TIER3_OPTIONS));
    expect(dimensions.D2.score).toBeGreaterThanOrEqual(40);
    expect(dimensions.D3.score).toBeGreaterThanOrEqual(40);
    expect(getCalculatedLevel(calculateIPRS(dimensions))).toBe("Preparada");
  });

  it("TEST 6 — Avanzada when IPRS >= 75 and every dimension >= 60", () => {
    const dimensions = calculateDimensions(buildInput(TIER4_OPTIONS));
    for (const id of ["D1", "D2", "D3", "D4", "D5"] as const) {
      expect(dimensions[id].score).toBeGreaterThanOrEqual(60);
    }
    expect(getCalculatedLevel(calculateIPRS(dimensions))).toBe("Avanzada");
  });

  it("TEST 28 — level logic uses the full decimal, display floors separately", () => {
    expect(getCalculatedLevel(49.8)).toBe("En desarrollo");
    expect(Math.floor(49.8)).toBe(49);
    // just below the boundary must not tip into the next level
    expect(getCalculatedLevel(24.999)).toBe("Inicial");
    expect(getCalculatedLevel(25)).toBe("En desarrollo");
    expect(getCalculatedLevel(74.999)).toBe("Preparada");
    expect(getCalculatedLevel(75)).toBe("Avanzada");
  });
});

describe("capLevel", () => {
  it("keeps the current level when it is already at or below the max", () => {
    expect(capLevel("Inicial", "Preparada")).toBe("Inicial");
    expect(capLevel("Preparada", "Preparada")).toBe("Preparada");
  });

  it("lowers the level when it exceeds the max, never raises it", () => {
    expect(capLevel("Avanzada", "En desarrollo")).toBe("En desarrollo");
    expect(capLevel("Inicial", "Avanzada")).toBe("Inicial");
  });

  it("the most restrictive of two sequential caps wins", () => {
    const capped = capLevel(capLevel("Avanzada", "Preparada"), "En desarrollo");
    expect(capped).toBe("En desarrollo");
  });
});
