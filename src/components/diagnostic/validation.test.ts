import { describe, expect, it } from "vitest";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import { FIELD_MAX_LENGTHS, validateLeadForm } from "./validation";

const VALID_LEAD: LeadFormValues = {
  firstName: "Ana",
  lastName: "Pérez",
  email: "ana@example.com",
  company: "Acme",
  jobTitle: "CEO",
  companySize: "small",
  industry: "Tecnología",
  phone: "",
};

describe("validateLeadForm", () => {
  it("accepts a fully valid lead with no phone", () => {
    expect(validateLeadForm(VALID_LEAD)).toEqual({});
  });

  it("accepts a numeric-only phone", () => {
    const errors = validateLeadForm({ ...VALID_LEAD, phone: "5551234567" });
    expect(errors.phone).toBeUndefined();
  });

  it("rejects a phone containing non-digit characters", () => {
    const errors = validateLeadForm({ ...VALID_LEAD, phone: "555-123-4567" });
    expect(errors.phone).toBeTruthy();
  });

  it("phone stays optional — empty is valid", () => {
    const errors = validateLeadForm({ ...VALID_LEAD, phone: undefined });
    expect(errors.phone).toBeUndefined();
  });

  it("rejects a field longer than its configured max length", () => {
    const tooLong = "a".repeat(FIELD_MAX_LENGTHS.firstName! + 1);
    const errors = validateLeadForm({ ...VALID_LEAD, firstName: tooLong });
    expect(errors.firstName).toBeTruthy();
  });

  it("accepts a field exactly at its configured max length", () => {
    const atMax = "a".repeat(FIELD_MAX_LENGTHS.firstName!);
    const errors = validateLeadForm({ ...VALID_LEAD, firstName: atMax });
    expect(errors.firstName).toBeUndefined();
  });

  it("rejects a phone longer than the E.164 15-digit limit", () => {
    const errors = validateLeadForm({ ...VALID_LEAD, phone: "1234567890123456" });
    expect(errors.phone).toBeTruthy();
  });

  it("required-field errors take priority over a length error on the same field", () => {
    const errors = validateLeadForm({ ...VALID_LEAD, firstName: "" });
    expect(errors.firstName).toBeTruthy();
  });
});
