import { INTRO_COPY, NAV_COPY } from "./copy";

type IntroScreenProps = {
  onStart: () => void;
};

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div class="enter-el mx-auto flex max-w-[620px] flex-col items-center gap-6 px-4 py-20 text-center">
      <span class="rounded-full bg-cell-green px-4 py-1 text-xs font-bold uppercase tracking-wide text-text-eyebrow">
        {INTRO_COPY.eyebrow}
      </span>
      <h1 class="font-heading text-3xl font-bold text-acento1">{INTRO_COPY.title}</h1>
      <p class="text-lg font-semibold uppercase tracking-wide text-text-muted">{INTRO_COPY.subtitle}</p>
      <p class="text-base text-acento1">{INTRO_COPY.body}</p>
      <button
        type="button"
        onClick={onStart}
        class="rounded-button bg-acento1 px-10 py-4 text-base font-bold text-white transition-colors hover:bg-[#345266]"
      >
        {NAV_COPY.startCta}
      </button>
    </div>
  );
}
