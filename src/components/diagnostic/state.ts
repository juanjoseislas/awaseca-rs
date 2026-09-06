import type { Answer, DiagnosticInput } from "../../lib/diagnostic";
import { calculateDiagnostic, QUESTIONS_BY_ID } from "../../lib/diagnostic";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import type { PersistedProgress } from "../../lib/diagnostic-progress-storage";
import { buildDiagnosticInput } from "./build-diagnostic-input";
import { validateAnswerForQuestion } from "./validation";
import { EMPTY_LEAD_FORM, INITIAL_WIZARD_STATE, type LeadFormErrors, type WizardState } from "./types";

export const MAIN_QUESTION_IDS = [
  "q1",
  "q2",
  "q3",
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
] as const;

export type WizardAction =
  | { type: "RESTORE"; payload: PersistedProgress }
  | { type: "START" }
  | { type: "RESET" }
  | { type: "SET_SINGLE_ANSWER"; questionId: string; answer: Answer }
  | { type: "TOGGLE_MULTI_ANSWER"; option: Answer; maxSelections?: number }
  | { type: "SET_TEXT"; text: string }
  | { type: "SET_LEAD_FIELD"; field: keyof LeadFormValues; value: string }
  | { type: "SET_LEAD_ERRORS"; errors: LeadFormErrors }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SUBMIT_LEAD_START" }
  | { type: "SUBMIT_LEAD_SUCCESS" }
  | { type: "SUBMIT_LEAD_ERROR"; error: string };

function currentQuestionId(questionIndex: number): string {
  return MAIN_QUESTION_IDS[questionIndex];
}

function computeResult(state: WizardState): WizardState {
  try {
    const input: DiagnosticInput = buildDiagnosticInput(state.answers);
    const result = calculateDiagnostic(input);
    return { ...state, result, screen: "lead-capture", fieldError: null, direction: "forward" };
  } catch (error) {
    console.error("[diagnostic] failed to compute result", error);
    return {
      ...state,
      screen: "error",
      fieldError: "Ocurrió un error al calcular tu diagnóstico. Intenta de nuevo.",
    };
  }
}

function handleNext(state: WizardState): WizardState {
  switch (state.screen) {
    case "question": {
      const questionId = currentQuestionId(state.questionIndex);
      const question = QUESTIONS_BY_ID[questionId];
      const currentAnswer =
        questionId === "q1" ? state.answers.q1 : (state.answers as Record<string, Answer>)[questionId];
      const validation = validateAnswerForQuestion(question, currentAnswer);

      if (!validation.valid) {
        return { ...state, fieldError: validation.message ?? null };
      }

      if (state.questionIndex < MAIN_QUESTION_IDS.length - 1) {
        return {
          ...state,
          questionIndex: state.questionIndex + 1,
          fieldError: null,
          direction: "forward",
        };
      }

      return { ...state, screen: "completed", fieldError: null, direction: "forward" };
    }

    case "completed":
      return { ...state, screen: "pre-result", direction: "forward" };

    case "pre-result":
      return { ...state, screen: "q16", direction: "forward" };

    case "q16":
      return { ...state, screen: "q17", direction: "forward" };

    case "q17":
      return computeResult(state);

    default:
      return state;
  }
}

function handleBack(state: WizardState): WizardState {
  switch (state.screen) {
    case "question": {
      if (state.questionIndex > 0) {
        return { ...state, questionIndex: state.questionIndex - 1, fieldError: null, direction: "backward" };
      }
      return { ...state, screen: "intro", direction: "backward" };
    }
    case "completed":
      return { ...state, screen: "question", questionIndex: MAIN_QUESTION_IDS.length - 1, direction: "backward" };
    case "pre-result":
      return { ...state, screen: "completed", direction: "backward" };
    case "q16":
      return { ...state, screen: "pre-result", direction: "backward" };
    case "q17":
      return { ...state, screen: "q16", direction: "backward" };
    case "lead-capture":
      return { ...state, screen: "q17", direction: "backward" };
    default:
      return state;
  }
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "RESTORE":
      return {
        ...state,
        screen: action.payload.screen,
        questionIndex: action.payload.questionIndex,
        answers: action.payload.answers,
      };

    case "START":
      return { ...INITIAL_WIZARD_STATE, screen: "question", questionIndex: 0 };

    case "RESET":
      return { ...INITIAL_WIZARD_STATE };

    case "SET_SINGLE_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
        fieldError: null,
      };

    case "TOGGLE_MULTI_ANSWER": {
      const current = state.answers.q1 ?? [];
      const exists = current.some((answer) => answer.optionId === action.option.optionId);
      if (exists) {
        return {
          ...state,
          answers: {
            ...state.answers,
            q1: current.filter((answer) => answer.optionId !== action.option.optionId),
          },
          fieldError: null,
        };
      }
      if (action.maxSelections && current.length >= action.maxSelections) {
        return state;
      }
      return {
        ...state,
        answers: { ...state.answers, q1: [...current, action.option] },
        fieldError: null,
      };
    }

    case "SET_TEXT":
      return { ...state, answers: { ...state.answers, q17: action.text } };

    case "SET_LEAD_FIELD":
      return {
        ...state,
        leadForm: { ...state.leadForm, [action.field]: action.value },
        leadErrors: { ...state.leadErrors, [action.field]: undefined },
      };

    case "NEXT":
      return handleNext(state);

    case "BACK":
      return handleBack(state);

    case "SET_LEAD_ERRORS":
      return { ...state, leadErrors: action.errors };

    case "SUBMIT_LEAD_START":
      return { ...state, submission: "submitting", submissionError: null };

    case "SUBMIT_LEAD_SUCCESS":
      return { ...state, submission: "submitted", screen: "results", direction: "forward" };

    case "SUBMIT_LEAD_ERROR":
      // Per spec: a stub-persistence failure never blocks the user from
      // seeing their free diagnostic — still reveal results.
      return {
        ...state,
        submission: "error",
        submissionError: action.error,
        screen: "results",
        direction: "forward",
      };

    default:
      return state;
  }
}

export function createLeadFormState(): LeadFormValues {
  return { ...EMPTY_LEAD_FORM };
}
