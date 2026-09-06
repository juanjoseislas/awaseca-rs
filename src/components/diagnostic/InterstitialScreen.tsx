type InterstitialScreenProps = {
  eyebrow: string;
  title: string;
  body: string;
  continueLabel: string;
  onContinue: () => void;
  onBack?: () => void;
  backLabel?: string;
};

/**
 * Shared shell for "100% completado" and "Antes de mostrarte tu
 * resultado" — never touches the progress bar/numbering (spec §5/§35).
 */
export function InterstitialScreen({
  eyebrow,
  title,
  body,
  continueLabel,
  onContinue,
  onBack,
  backLabel,
}: InterstitialScreenProps) {
  return (
    <div class="enter-el mx-auto flex max-w-[620px] flex-col items-center gap-5 px-4 py-20 text-center">
      <span class="rounded-full bg-cell-green px-4 py-1 text-xs font-bold uppercase tracking-wide text-text-eyebrow">
        {eyebrow}
      </span>
      <h1 class="font-heading text-2xl font-bold text-acento1">{title}</h1>
      <p class="text-base text-text-muted">{body}</p>
      <div class="mt-2 flex items-center gap-4">
        {onBack ? (
          <button type="button" onClick={onBack} class="text-sm font-medium text-silver hover:text-acento1">
            {backLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onContinue}
          class="rounded-button bg-acento1 px-8 py-3 text-sm font-bold text-white hover:bg-[#345266]"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
