import { useState } from "preact/hooks";
import type { CTAResult, Level } from "../../lib/diagnostic";
import ctaArrowUrl from "../../assets/diagnostic/cta-arrow-icon.svg?url";
import { BOOKING_URL, RESULTS_COPY, SHARE_COPY, SHARE_URL } from "./copy";

type FinalCTASectionProps = {
  cta: CTAResult;
  finalLevel: Level;
  displayIprs: number;
  onCtaClick: () => void;
};

export function FinalCTASection({ cta, finalLevel, displayIprs, onCtaClick }: FinalCTASectionProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = SHARE_COPY.text(finalLevel, displayIprs);

    if (navigator.share) {
      try {
        await navigator.share({ title: SHARE_COPY.title, text, url: SHARE_URL });
      } catch {
        // User cancelled the share sheet or it failed — nothing to recover.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no further fallback.
    }
  };

  return (
    <section class="w-full bg-[linear-gradient(225deg,var(--color-bluenavy),var(--color-azul))] px-8 py-24">
      <div class="mx-auto flex max-w-[680px] flex-col items-center gap-6 text-center">
        <span class="rounded-full border border-[rgba(102,204,153,0.25)] bg-[rgba(102,204,153,0.1)] px-5 py-1.5 text-[13px] text-[rgba(255,255,255,0.72)]">
          <span class="font-bold text-verde">200+</span> {RESULTS_COPY.finalCta.trustBadge}
        </span>
        <p class="text-[11px] font-bold uppercase tracking-wide text-verde min-[700px]:text-[13px]">{RESULTS_COPY.finalCta.eyebrow}</p>
        <h2 class="font-heading text-[46px] font-bold leading-[52.9px] tracking-[-0.46px] text-white">
          {cta.title}
        </h2>
        <p class="whitespace-pre-line text-[17px] leading-[28.9px] text-[rgba(255,255,255,0.78)]">{cta.body}</p>
        <p class="text-[21px] font-bold leading-[28.9px] text-[rgba(255,255,255,0.78)]">{cta.nextStep}</p>
        {cta.modifier ? (
          <p class="text-[17px] leading-[28.9px] text-[rgba(255,255,255,0.6)]">{cta.modifier}</p>
        ) : null}
        <div class="mt-1 flex flex-col items-center gap-3">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCtaClick}
            class="flex items-center gap-2.5 rounded-cta bg-verde px-14 py-4 text-[18px] font-bold text-bluenavy shadow-[0_4px_9px_rgba(102,204,153,0.22)]"
          >
            {cta.buttonLabel}
            <img src={ctaArrowUrl} alt="" class="size-[18px]" />
          </a>
          <p class="text-xs text-[rgba(255,255,255,0.42)]">{RESULTS_COPY.finalCta.disclaimerNote}</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          class="mt-2 text-[13px] text-[rgba(255,255,255,0.38)] underline-offset-2 hover:underline"
        >
          {copied ? SHARE_COPY.copiedLabel : RESULTS_COPY.finalCta.shareLink}
        </button>
      </div>
    </section>
  );
}
