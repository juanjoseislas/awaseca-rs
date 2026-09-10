import { useEffect } from "preact/hooks";
import type { Answer, Question } from "../../lib/diagnostic";
import { DIMENSIONS } from "../../lib/diagnostic";
import { CardChoiceField } from "./CardChoiceField";
import { OpenTextField } from "./OpenTextField";
import { NAV_COPY, STAGE_LABELS, VALIDATION_COPY } from "./copy";
import { StageProgress, type Stage } from "./StageProgress";

type QuestionScreenProps = {
  question: Question;
  value: Answer[] | Answer | string | undefined;
  fieldError: string | null;
  isFirst: boolean;
  stage: Stage;
  stageProgress: number;
  caption: string | null;
  onSelectSingle: (answer: Answer) => void;
  onToggleMulti: (answer: Answer) => void;
  onTextChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function QuestionScreen({
  question,
  value,
  fieldError,
  isFirst,
  stage,
  stageProgress,
  caption,
  onSelectSingle,
  onToggleMulti,
  onTextChange,
  onNext,
  onBack,
}: QuestionScreenProps) {
  const isOpenText = question.type === "textarea";
  const eyebrow = question.dimension ? DIMENSIONS[question.dimension].name : STAGE_LABELS[stage];

  // Fixes a mobile UX bug: without this, advancing to the next question
  // (this component remounts fresh each time, keyed by questionId) kept
  // the browser's current scroll position, so the new question rendered
  // off-screen below the Siguiente button the user just tapped, forcing a
  // manual scroll-up to read it. Instant, not smooth: a smooth scroll runs
  // for ~300-500ms at the same time .enter-el's entrance animation is
  // already playing (both start at mount), so the content either animates
  // in while still off-screen or gets visually swamped by the bigger
  // scroll motion — either way the entrance reads as "not there". The
  // scroll-position fix should be an invisible correction; the entrance
  // animation should be the only motion the user actually perceives.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isEmpty = isOpenText
    ? !(value as string | undefined)?.trim()
    : question.type === "multiple"
      ? !(value as Answer[] | undefined)?.length
      : !value;
  const isSkippable = !question.required && isEmpty;
  const nextLabel = isOpenText ? NAV_COPY.next : isSkippable ? NAV_COPY.skip : NAV_COPY.next;
  const showSkipLink = isOpenText && !question.required;

  return (
    <div class="mx-auto flex max-w-[620px] flex-col gap-6 px-4 py-12">
      <StageProgress activeStage={stage} activeStageProgress={stageProgress} caption={caption} />

      <p class="enter-el text-sm font-semibold uppercase tracking-wide text-azul">{eyebrow}</p>
      <h1 class="enter-el text-[32px] font-semibold leading-tight text-acento1" style={{ animationDelay: "30ms" }}>
        {question.text}
      </h1>
      {question.maxSelections ? (
        <p class="enter-el -mt-4 text-sm text-text-muted" style={{ animationDelay: "55ms" }}>
          {VALIDATION_COPY.maxSelectionsHint(question.maxSelections)}
        </p>
      ) : null}

      <div style={{ animationDelay: "65ms" }}>
        {isOpenText ? (
          <OpenTextField value={(value as string) ?? ""} onChange={onTextChange} />
        ) : (
          <CardChoiceField
            question={question}
            value={value as Answer[] | Answer | undefined}
            onSelectSingle={onSelectSingle}
            onToggleMulti={onToggleMulti}
          />
        )}
      </div>

      {fieldError ? <p class="text-sm font-medium text-[#c0392b]">{fieldError}</p> : null}

      <div class="mt-4 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          {!isFirst ? (
            <button
              type="button"
              onClick={onBack}
              class="link-underline text-sm font-medium text-silver transition-colors hover:text-acento1"
            >
              {NAV_COPY.back}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onNext}
            class="press-scale rounded-button bg-acento1 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#345266]"
          >
            {nextLabel}
          </button>
        </div>
        {showSkipLink ? (
          <div class="flex justify-end">
            <button
              type="button"
              onClick={onNext}
              class="link-underline text-sm font-medium text-silver transition-colors hover:text-acento1"
            >
              {NAV_COPY.skip}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
