import type { Answer, Question } from "../../lib/diagnostic";
import { DIMENSIONS } from "../../lib/diagnostic";
import { CardChoiceField } from "./CardChoiceField";
import { OpenTextField } from "./OpenTextField";
import { NAV_COPY, STAGE_LABELS, VALIDATION_COPY } from "./copy";
import { StageProgress, type Stage } from "./StageProgress";

/**
 * Fixes a mobile UX bug: advancing to the next question used to keep the
 * browser's current scroll position, so the new question rendered
 * off-screen below the Siguiente button the user just tapped.
 *
 * Sequenced, not simultaneous: scroll the *current* content back to the
 * top first, and only mount the next question once that settles — doing
 * both at once (an instant jump plus a fresh entrance animation, or a
 * smooth scroll racing that same animation) is what read as harsh. Skipped
 * entirely when there's nothing meaningful to scroll (most short
 * questions never move the button far from the top), so this never adds
 * latency to the common case across a 17-question flow.
 */
function scrollToTopThenRun(action: () => void) {
  if (window.scrollY < 40) {
    action();
    return;
  }

  let done = false;
  let fallbackId: ReturnType<typeof setTimeout>;
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", finish);
    clearTimeout(fallbackId);
    action();
  };

  // `scrollend` covers the common case precisely; the timeout is a safety
  // net for browsers that don't support it (or any edge case where it
  // never fires) so a tap can never feel stuck.
  fallbackId = setTimeout(finish, 350);
  window.addEventListener("scrollend", finish, { once: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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
              onClick={() => scrollToTopThenRun(onBack)}
              class="link-underline text-sm font-medium text-silver transition-colors hover:text-acento1"
            >
              {NAV_COPY.back}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => scrollToTopThenRun(onNext)}
            class="press-scale rounded-button bg-acento1 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#345266]"
          >
            {nextLabel}
          </button>
        </div>
        {showSkipLink ? (
          <div class="flex justify-end">
            <button
              type="button"
              onClick={() => scrollToTopThenRun(onNext)}
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
