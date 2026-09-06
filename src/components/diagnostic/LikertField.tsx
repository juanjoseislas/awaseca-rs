import type { Answer, Question } from "../../lib/diagnostic";
import { listItemDelay } from "./motion";

type LikertFieldProps = {
  question: Question;
  value: Answer | undefined;
  onSelect: (answer: Answer) => void;
};

/**
 * 5(or 4)-point dot-scale for Q4-Q15's degree/frequency questions. Desktop:
 * options in a row, dot above label. Mobile (<=599px): stacked vertical,
 * label to the right of the dot (handoff §3).
 */
export function LikertField({ question, value, onSelect }: LikertFieldProps) {
  const options = question.options ?? [];

  return (
    <div class="flex flex-col gap-2 max-[599px]:gap-2 min-[600px]:flex-row min-[600px]:gap-3">
      {options.map((option, index) => {
        const isSelected = value?.optionId === option.id;
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
            aria-pressed={isSelected}
            onClick={() => onSelect(answer)}
            class={[
              "enter-el flex flex-1 items-center gap-3 rounded-card border-[1.5px] px-4 py-3 text-left transition-colors",
              "min-[600px]:flex-col min-[600px]:items-center min-[600px]:gap-2 min-[600px]:text-center",
              isSelected
                ? "border-verde bg-cell-green font-semibold text-acento1"
                : "border-[#e2e2e2] bg-white text-acento1 hover:border-azul",
            ].join(" ")}
            style={{ animationDelay: `${listItemDelay(index)}ms` }}
          >
            <span
              class={[
                "flex size-[22px] shrink-0 items-center justify-center rounded-full border-2",
                isSelected ? "border-verde bg-verde" : "border-[#c7c7c7] bg-white",
              ].join(" ")}
              aria-hidden="true"
            />
            <span class="text-sm">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
