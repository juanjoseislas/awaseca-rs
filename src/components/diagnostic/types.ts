import type { DiagnosticInput, DiagnosticResult } from "../../lib/diagnostic";
import type { LeadFormValues } from "../../lib/diagnostic-submission";

export type WizardScreen =
  | "question"
  | "completed"
  | "q16"
  | "q17"
  | "lead-capture"
  | "results"
  | "error";

export type SubmissionStatus = "idle" | "submitting" | "submitted" | "error";

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

export const EMPTY_LEAD_FORM: LeadFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  jobTitle: "",
  companySize: "",
  industry: "",
  phone: "",
};

export type WizardState = {
  screen: WizardScreen;
  questionIndex: number;
  answers: Partial<DiagnosticInput>;
  fieldError: string | null;
  result: DiagnosticResult | null;
  leadForm: LeadFormValues;
  leadErrors: LeadFormErrors;
  submission: SubmissionStatus;
  submissionError: string | null;
  direction: "forward" | "backward";
};

export const INITIAL_WIZARD_STATE: WizardState = {
  screen: "question",
  questionIndex: 0,
  answers: { q1: [] },
  fieldError: null,
  result: null,
  leadForm: EMPTY_LEAD_FORM,
  leadErrors: {},
  submission: "idle",
  submissionError: null,
  direction: "forward",
};
