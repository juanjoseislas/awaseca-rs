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

  it("NEXT on the last main question (Q15) moves to 'completed'", () => {
    const state = stateAt("question", {
      questionIndex: MAIN_QUESTION_IDS.length - 1,
      answers: { q1: [], q15: answerFor("q15", "q15_regular") },
    });
    const next = wizardReducer(state, { type: "NEXT" });
    expect(next.screen).toBe("completed");
  });

  it("the completed -> q16 -> q17 chain advances without validation blocking", () => {
    let state = stateAt("completed");
    state = wizardReducer(state, { type: "NEXT" });
    expect(state.screen).toBe("q16");
    state = wizardReducer(state, { type: "NEXT" });
    expect(state.screen).toBe("q17");
  });

  it("Q16/Q17 never increment questionIndex or touch the Q1-15 progress counter", () => {
    const state = stateAt("q16", { questionIndex: MAIN_QUESTION_IDS.length - 1 });
    const next = wizardReducer(state, { type: "NEXT" });
    expect(next.questionIndex).toBe(MAIN_QUESTION_IDS.length - 1);
  });

  it("NEXT from q17 computes the result and moves to lead-capture, without revealing it", () => {
    const answers: WizardState["answers"] = { q1: [answerFor("q1", "q1_regulatory")] };
    for (const id of MAIN_QUESTION_IDS.slice(1)) {
      const firstOption = QUESTIONS_BY_ID[id].options![0];
      (answers as Record<string, Answer>)[id] = answerFor(id, firstOption.id);
    }
    const state = stateAt("q17", { answers });
    const next = wizardReducer(state, { type: "NEXT" });

    expect(next.screen).toBe("lead-capture");
    expect(next.result).not.toBeNull();
    expect(next.result?.iprs).toBeGreaterThanOrEqual(0);
  });

  it("NEXT from q17 with incomplete answers routes to the error screen instead of throwing", () => {
    const state = stateAt("q17", { answers: { q1: [] } });
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

  it("BACK from q16 returns to the completed interstitial", () => {
    const state = stateAt("q16");
    const next = wizardReducer(state, { type: "BACK" });
    expect(next.screen).toBe("completed");
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
    const state = stateAt("q17", { questionIndex: 10 });
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
