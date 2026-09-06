import { NAV_COPY, RESUME_PROMPT_COPY } from "./copy";

type ResumePromptProps = {
  onContinue: () => void;
  onRestart: () => void;
};

export function ResumePrompt({ onContinue, onRestart }: ResumePromptProps) {
  return (
    <div class="enter-el mx-auto flex max-w-[500px] flex-col items-center gap-5 px-4 py-20 text-center">
      <h1 class="font-heading text-2xl font-bold text-acento1">{RESUME_PROMPT_COPY.title}</h1>
      <p class="text-base text-text-muted">{RESUME_PROMPT_COPY.body}</p>
      <div class="flex gap-3">
        <button
          type="button"
          onClick={onContinue}
          class="rounded-button bg-acento1 px-6 py-3 text-sm font-bold text-white"
        >
          {NAV_COPY.continueProgress}
        </button>
        <button
          type="button"
          onClick={onRestart}
          class="rounded-button border border-silver px-6 py-3 text-sm font-semibold text-text-muted hover:text-acento1"
        >
          {NAV_COPY.restart}
        </button>
      </div>
    </div>
  );
}
