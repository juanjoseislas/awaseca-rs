import type { Answer, Question } from "../../lib/diagnostic";
import checkIconUrl from "../../assets/diagnostic/check-icon.svg?url";
import { listItemDelay } from "./motion";

type CardChoiceFieldProps = {
  question: Question;
  value: Answer[] | Answer | undefined;
  onSelectSingle: (answer: Answer) => void;
  onToggleMulti: (answer: Answer) => void;
};

/**
 * Vertical list of full-width option rows (single- and multi-select alike),
 * each with a right-side selection indicator — used for every radio/
 * checkbox-style question (Q1-Q3, the Q4-Q15 scored questions, Q16) so the
 * whole questionnaire shares one consistent option pattern.
 */
export function CardChoiceField({ question, value, onSelectSingle, onToggleMulti }: CardChoiceFieldProps) {
  const isMultiple = question.type === "multiple";
  const selectedIds = isMultiple
    ? new Set((value as Answer[] | undefined)?.map((a) => a.optionId) ?? [])
    : new Set(value ? [(value as Answer).optionId] : []);
  const atCap =
    isMultiple && question.maxSelections ? selectedIds.size >= question.maxSelections : false;

  return (
    <div class="flex flex-col gap-3">
      {(question.options ?? []).map((option, index) => {
        const isSelected = selectedIds.has(option.id);
        const isDisabled = isMultiple && atCap && !isSelected;
        const answer: Answer = {
          questionId: question.id,
          optionId: option.id,
          label: option.label,
          score: option.score,
        };

        return (
          <button
            key={option.id}
            type="button"
            aria-disabled={isDisabled}
            aria-pressed={isSelected}
            role={isMultiple ? "checkbox" : "radio"}
            // Not a native `disabled` button: an at-cap option must still
            // receive the click so onToggleMulti can surface the "Máximo
            // dos opciones" message instead of silently doing nothing.
            onClick={() => (isMultiple ? onToggleMulti(answer) : onSelectSingle(answer))}
            class={[
              "enter-el flex w-full items-center gap-4 rounded-card border-[1.5px] px-5 py-4 text-left text-base transition-colors",
              isSelected
                ? "border-verde bg-cell-green font-semibold text-acento1"
                : "border-[#e2e2e2] bg-white text-acento1 hover:border-azul",
              isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
            ].join(" ")}
            style={{ animationDelay: `${listItemDelay(index)}ms` }}
          >
            <span class="flex-1">{option.label}</span>
            <span class="shrink-0" aria-hidden="true">
              {isSelected ? (
                <img src={checkIconUrl} alt="" class="size-6" />
              ) : (
                <span class="block size-6 rounded-full border-2 border-[#c7c7c7]" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
