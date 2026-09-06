import { useEffect, useReducer, useState } from "preact/hooks";
import type { Answer } from "../../lib/diagnostic";
import { QUESTIONS_BY_ID } from "../../lib/diagnostic";
import { saveDiagnosticSubmission } from "../../lib/diagnostic-submission";
import {
  clearProgress,
  loadProgress,
  saveProgress,
  type PersistedProgress,
} from "../../lib/diagnostic-progress-storage";
import { ContactGateForm } from "./ContactGateForm";
import { InterstitialScreen } from "./InterstitialScreen";
import { IntroScreen } from "./IntroScreen";
import { QuestionScreen } from "./QuestionScreen";
import { ResultsScreen } from "./ResultsScreen";
import { ResumePrompt } from "./ResumePrompt";
import { Topbar } from "./Topbar";
import { COMPLETED_COPY, NAV_COPY, PRE_RESULT_COPY } from "./copy";
import { MAIN_QUESTION_IDS, wizardReducer } from "./state";
import { INITIAL_WIZARD_STATE } from "./types";
import { validateLeadForm } from "./validation";
import type { Stage } from "./StageProgress";

const RESUMABLE_SCREENS = new Set(["question", "completed", "pre-result", "q16", "q17"]);
const PERFIL_COUNT = 3;
const DIAGNOSTICO_COUNT = MAIN_QUESTION_IDS.length - PERFIL_COUNT;

function stageForQuestionIndex(index: number): { stage: Stage; stageProgress: number } {
  if (index < PERFIL_COUNT) {
    return { stage: "perfil", stageProgress: ((index + 1) / PERFIL_COUNT) * 100 };
  }
  return { stage: "diagnostico", stageProgress: ((index - PERFIL_COUNT + 1) / DIAGNOSTICO_COUNT) * 100 };
}

export function DiagnosticApp() {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_WIZARD_STATE);
  const [pendingResume, setPendingResume] = useState<PersistedProgress | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    const saved = loadProgress();
    if (saved) setPendingResume(saved);
    setCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!checkedStorage || pendingResume) return;
    if (RESUMABLE_SCREENS.has(state.screen)) {
      saveProgress({ screen: state.screen, questionIndex: state.questionIndex, answers: state.answers });
    }
    if (state.screen === "results") {
      clearProgress();
    }
  }, [checkedStorage, pendingResume, state.screen, state.questionIndex, state.answers]);

  if (!checkedStorage) return null;

  if (pendingResume) {
    return (
      <div class="w-full">
        <Topbar />
        <ResumePrompt
          onContinue={() => {
            dispatch({ type: "RESTORE", payload: pendingResume });
            setPendingResume(null);
          }}
          onRestart={() => {
            clearProgress();
            setPendingResume(null);
          }}
        />
      </div>
    );
  }

  const handleLeadSubmit = async () => {
    const errors = validateLeadForm(state.leadForm);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_LEAD_ERRORS", errors });
      return;
    }
    if (!state.result) return;

    dispatch({ type: "SUBMIT_LEAD_START" });
    const outcome = await saveDiagnosticSubmission({
      lead: state.leadForm,
      answers: state.answers as never, // fully built by the time we reach lead-capture
      result: state.result,
      submittedAt: new Date().toISOString(),
    });

    if (outcome.ok) {
      dispatch({ type: "SUBMIT_LEAD_SUCCESS" });
    } else {
      dispatch({ type: "SUBMIT_LEAD_ERROR", error: outcome.error });
    }
  };

  if (state.screen === "intro") {
    return (
      <div class="w-full">
        <Topbar />
        <IntroScreen onStart={() => dispatch({ type: "START" })} />
      </div>
    );
  }

  if (state.screen === "question") {
    const questionId = MAIN_QUESTION_IDS[state.questionIndex];
    const question = QUESTIONS_BY_ID[questionId];
    const { stage, stageProgress } = stageForQuestionIndex(state.questionIndex);
    const value =
      questionId === "q1" ? state.answers.q1 : (state.answers as Record<string, Answer>)[questionId];

    return (
      <div class="w-full">
        <Topbar />
        <QuestionScreen
          question={question}
          value={value}
          fieldError={state.fieldError}
          isFirst={state.questionIndex === 0}
          stage={stage}
          stageProgress={stageProgress}
          caption={`Pregunta ${state.questionIndex + 1} de ${MAIN_QUESTION_IDS.length}`}
          onSelectSingle={(answer) => dispatch({ type: "SET_SINGLE_ANSWER", questionId, answer })}
          onToggleMulti={(answer) =>
            dispatch({ type: "TOGGLE_MULTI_ANSWER", option: answer, maxSelections: question.maxSelections })
          }
          onTextChange={() => {}}
          onNext={() => dispatch({ type: "NEXT" })}
          onBack={() => dispatch({ type: "BACK" })}
        />
      </div>
    );
  }

  if (state.screen === "completed") {
    return (
      <div class="w-full">
        <Topbar />
        <InterstitialScreen
          eyebrow={COMPLETED_COPY.eyebrow}
          title={COMPLETED_COPY.title}
          body={COMPLETED_COPY.body}
          continueLabel={COMPLETED_COPY.continueLabel}
          onContinue={() => dispatch({ type: "NEXT" })}
        />
      </div>
    );
  }

  if (state.screen === "pre-result") {
    return (
      <div class="w-full">
        <Topbar />
        <InterstitialScreen
          eyebrow={PRE_RESULT_COPY.eyebrow}
          title={PRE_RESULT_COPY.title}
          body={PRE_RESULT_COPY.body}
          continueLabel={NAV_COPY.next}
          onContinue={() => dispatch({ type: "NEXT" })}
          onBack={() => dispatch({ type: "BACK" })}
          backLabel={NAV_COPY.back}
        />
      </div>
    );
  }

  if (state.screen === "q16" || state.screen === "q17") {
    const questionId = state.screen;
    const question = QUESTIONS_BY_ID[questionId];
    const value = questionId === "q16" ? state.answers.q16 : state.answers.q17;

    return (
      <div class="w-full">
        <Topbar />
        <QuestionScreen
          question={question}
          value={value}
          fieldError={state.fieldError}
          isFirst={false}
          stage="diagnostico"
          stageProgress={100}
          caption={null}
          onSelectSingle={(answer) => dispatch({ type: "SET_SINGLE_ANSWER", questionId, answer })}
          onToggleMulti={() => {}}
          onTextChange={(text) => dispatch({ type: "SET_TEXT", text })}
          onNext={() => dispatch({ type: "NEXT" })}
          onBack={() => dispatch({ type: "BACK" })}
        />
      </div>
    );
  }

  if (state.screen === "lead-capture") {
    return (
      <div class="w-full">
        <Topbar />
        <ContactGateForm
          values={state.leadForm}
          errors={state.leadErrors}
          submission={state.submission}
          onChange={(field, value) => dispatch({ type: "SET_LEAD_FIELD", field, value })}
          onSubmit={handleLeadSubmit}
        />
      </div>
    );
  }

  if (state.screen === "results" && state.result) {
    return (
      <ResultsScreen result={state.result} answers={state.answers as never} lead={state.leadForm} />
    );
  }

  return (
    <div class="w-full">
      <Topbar />
      <div class="mx-auto max-w-[500px] px-4 py-20 text-center">
        <p class="text-base text-[#c0392b]">
          {state.fieldError ?? "Ocurrió un error inesperado. Por favor recarga la página."}
        </p>
      </div>
    </div>
  );
}
