import { describe, expect, it } from "vitest";
import { buildInput } from "../test-fixtures";
import { DiagnosticValidationError, validateDiagnosticInput } from "./validate-input";

describe("validateDiagnosticInput", () => {
  it("TEST 13 — accepts 1 or 2 Q1 selections", () => {
    expect(() => validateDiagnosticInput(buildInput({}, { q1: ["q1_regulatory"] }))).not.toThrow();
    expect(() =>
      validateDiagnosticInput(buildInput({}, { q1: ["q1_regulatory", "q1_clients"] })),
    ).not.toThrow();
  });

  it("TEST 13 — rejects 3 Q1 selections", () => {
    const input = buildInput({}, { q1: ["q1_regulatory", "q1_clients", "q1_investors"] });
    expect(() => validateDiagnosticInput(input)).toThrow(DiagnosticValidationError);
  });

  it("TEST 13 — rejects 0 Q1 selections", () => {
    const input = buildInput({});
    input.q1 = [];
    expect(() => validateDiagnosticInput(input)).toThrow(DiagnosticValidationError);
  });

  it("rejects a missing Q4-Q15 answer", () => {
    const input = buildInput({});
    // @ts-expect-error simulating a malformed/incomplete payload
    delete input.q9;
    expect(() => validateDiagnosticInput(input)).toThrow(DiagnosticValidationError);
  });

  it("rejects an optionId that doesn't belong to its question", () => {
    const input = buildInput({});
    input.q9 = { questionId: "q9", optionId: "q10_formal", label: "wrong", score: 4 };
    expect(() => validateDiagnosticInput(input)).toThrow(DiagnosticValidationError);
  });

  it("accepts an omitted optional Q16", () => {
    const input = buildInput({});
    expect(input.q16).toBeUndefined();
    expect(() => validateDiagnosticInput(input)).not.toThrow();
  });

  it("rejects an invalid Q16 optionId when Q16 is present", () => {
    const input = buildInput({});
    input.q16 = { questionId: "q16", optionId: "not_a_real_option", label: "x" };
    expect(() => validateDiagnosticInput(input)).toThrow(DiagnosticValidationError);
  });
});
