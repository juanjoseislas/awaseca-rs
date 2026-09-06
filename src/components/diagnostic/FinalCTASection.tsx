import type { CTAResult } from "../../lib/diagnostic";
import ctaArrowUrl from "../../assets/diagnostic/cta-arrow-icon.svg?url";
import { RESULTS_COPY } from "./copy";

type FinalCTASectionProps = {
  cta: CTAResult;
  onCtaClick: () => void;
};

export function FinalCTASection({ cta, onCtaClick }: FinalCTASectionProps) {
  return (
    <section class="w-full bg-gradient-to-b from-[#021e33] to-bluenavy px-8 py-24">
      <div class="mx-auto flex max-w-[680px] flex-col items-center gap-6 text-center">
        <span class="rounded-full border border-[rgba(102,204,153,0.25)] bg-[rgba(102,204,153,0.1)] px-5 py-1.5 text-[13px] text-[rgba(255,255,255,0.72)]">
          <span class="font-bold text-verde">200+</span> {RESULTS_COPY.finalCta.trustBadge}
        </span>
        <p class="text-[11px] font-bold uppercase tracking-wide text-verde">{RESULTS_COPY.finalCta.eyebrow}</p>
        <h2 class="font-heading text-[46px] font-bold leading-[52.9px] tracking-[-0.46px] text-white">
          {cta.title}
        </h2>
        <p class="text-[17px] leading-[28.9px] text-[rgba(255,255,255,0.78)]">{cta.body}</p>
        {cta.modifier ? (
          <p class="text-[17px] leading-[28.9px] text-[rgba(255,255,255,0.6)]">{cta.modifier}</p>
        ) : null}
        <div class="mt-1 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onCtaClick}
            class="flex items-center gap-2.5 rounded-cta bg-verde px-14 py-4 text-[18px] font-bold text-bluenavy shadow-[0_4px_9px_rgba(102,204,153,0.22)]"
          >
            {cta.buttonLabel}
            <img src={ctaArrowUrl} alt="" class="size-[18px]" />
          </button>
          <p class="text-xs text-[rgba(255,255,255,0.42)]">{RESULTS_COPY.finalCta.disclaimerNote}</p>
        </div>
        <a href="#" class="mt-2 text-[13px] text-[rgba(255,255,255,0.38)]">
          {RESULTS_COPY.finalCta.shareLink}
        </a>
      </div>
    </section>
  );
}
