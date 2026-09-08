import { describe, expect, it } from "vitest";
import { QUESTIONS_BY_ID } from "../../lib/diagnostic";
import type { Answer } from "../../lib/diagnostic";
import { INITIAL_WIZARD_STATE, type WizardState } from "./types";
import { MAIN_QUESTION_IDS, wizardReducer } from "./state";

function answerFor(questionId: string, optionId: string): Answer {
  const option = QUESTIONS_BY_ID[questionId].options!.find((o) => o.id === optionId)!;
  return { questionId, optionId, label: option.label, score: option.score };
}

function stateAt(screen: WizardState["screen"], overrides: Partial<WizardState> = {}): WizardState {
  return { ...INITIAL_WIZARD_STATE, screen, ...overrides };
}

describe("wizardReducer", () => {
  it("the initial state starts directly on the first question — no intro screen", () => {
    expect(INITIAL_WIZARD_STATE.screen).toBe("question");
    expect(INITIAL_WIZARD_STATE.questionIndex).toBe(0);
  });

  it("NEXT on a required single-select question without an answer blocks advancing", () => {
    const state = stateAt("question", { questionIndex: 3 }); // q4, required
    const next = wizardReducer(state, { type: "NEXT" });
    expect(next.screen).toBe("question");
    expect(next.questionIndex).toBe(3);
    expect(next.fieldError).not.toBeNull();
  });

  it("NEXT advances to the next question once answered", () => {
    const state = stateAt("question", {
      questionIndex: 3,
      answers: { q1: [], q4: answerFor("q4", "q4_regular") },
    });
    const next = wizardReducer(state, { type: "NEXT" });
    expect(next.screen).toBe("question");
    expect(next.questionIndex).toBe(4);
    expect(next.fieldError).toBeNull();
  });

  it("NEXT on an optional unanswered question (Q16) advances without blocking", () => {
    const q16Index = MAIN_QUESTION_IDS.indexOf("q16");
    const state = stateAt("question", { questionIndex: q16Index, answers: { q1: [] } });
    const next = wizardReducer(state, { type: "NEXT" });
    expect(next.screen).toBe("question");
    expect(next.questionIndex).toBe(q16Index + 1);
    expect(next.fieldError).toBeNull();
  });

  it("NEXT from the last question (Q17) computes the result and moves to lead-capture, without revealing it", () => {
    const answers: WizardState["answers"] = { q1: [answerFor("q1", "q1_regulatory")] };
    for (const id of MAIN_QUESTION_IDS.slice(1)) {
      const question = QUESTIONS_BY_ID[id];
      if (question.type === "textarea") continue;
      const firstOption = question.options![0];
      (answers as Record<string, Answer>)[id] = answerFor(id, firstOption.id);
    }
    const state = stateAt("question", { questionIndex: MAIN_QUESTION_IDS.length - 1, answers });
    const next = wizardReducer(state, { type: "NEXT" });

    expect(next.screen).toBe("lead-capture");
    expect(next.result).not.toBeNull();
    expect(next.result?.iprs).toBeGreaterThanOrEqual(0);
  });

  it("NEXT from the last question with incomplete answers routes to the error screen instead of throwing", () => {
    const state = stateAt("question", {
      questionIndex: MAIN_QUESTION_IDS.length - 1,
      answers: { q1: [] },
    });
    const next = wizardReducer(state, { type: "NEXT" });
    expect(next.screen).toBe("error");
  });

  it("TOGGLE_MULTI_ANSWER respects maxSelections and never exceeds it", () => {
    let state = stateAt("question", { questionIndex: 0, answers: { q1: [] } });
    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_regulatory"),
      maxSelections: 2,
    });
    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_clients"),
      maxSelections: 2,
    });
    expect(state.answers.q1).toHaveLength(2);

    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_investors"),
      maxSelections: 2,
    });
    expect(state.answers.q1).toHaveLength(2);
    expect(state.answers.q1?.some((a) => a.optionId === "q1_investors")).toBe(false);
  });

  it("TOGGLE_MULTI_ANSWER deselects an already-chosen option", () => {
    let state = stateAt("question", {
      questionIndex: 0,
      answers: { q1: [answerFor("q1", "q1_regulatory")] },
    });
    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_regulatory"),
      maxSelections: 2,
    });
    expect(state.answers.q1).toHaveLength(0);
  });

  it("BACK from question 0 is a no-op — there is no earlier screen", () => {
    const state = stateAt("question", { questionIndex: 0 });
    const next = wizardReducer(state, { type: "BACK" });
    expect(next.screen).toBe("question");
    expect(next.questionIndex).toBe(0);
  });

  it("BACK from lead-capture returns to the last question (Q17)", () => {
    const state = stateAt("lead-capture");
    const next = wizardReducer(state, { type: "BACK" });
    expect(next.screen).toBe("question");
    expect(next.questionIndex).toBe(MAIN_QUESTION_IDS.length - 1);
  });

  it("BACK preserves previously entered answers", () => {
    const state = stateAt("question", {
      questionIndex: 1,
      answers: { q1: [answerFor("q1", "q1_regulatory")] },
    });
    const next = wizardReducer(state, { type: "BACK" });
    expect(next.questionIndex).toBe(0);
    expect(next.answers.q1).toEqual([answerFor("q1", "q1_regulatory")]);
  });

  it("SUBMIT_LEAD_ERROR still reveals results — a stub-persistence failure must not block the user", () => {
    const state = stateAt("lead-capture", { submission: "submitting" });
    const next = wizardReducer(state, { type: "SUBMIT_LEAD_ERROR", error: "network down" });
    expect(next.screen).toBe("results");
    expect(next.submission).toBe("error");
  });

  it("RESET returns to the initial state — first question, no answers", () => {
    const state = stateAt("question", { questionIndex: 10 });
    const next = wizardReducer(state, { type: "RESET" });
    expect(next.screen).toBe("question");
    expect(next.questionIndex).toBe(0);
  });

  it("TOGGLE_MULTI_ANSWER surfaces a short message when the cap is exceeded", () => {
    let state = stateAt("question", { questionIndex: 0, answers: { q1: [] } });
    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_regulatory"),
      maxSelections: 2,
    });
    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_clients"),
      maxSelections: 2,
    });
    state = wizardReducer(state, {
      type: "TOGGLE_MULTI_ANSWER",
      option: answerFor("q1", "q1_investors"),
      maxSelections: 2,
    });
    expect(state.fieldError).toBe("Máximo dos opciones.");
  });
});
