import type { CTAResult } from "../../lib/diagnostic";
import { BOOKING_URL } from "./copy";
import { useScrollProgress } from "./motion";

type StickyMiniHeaderProps = {
  displayIprs: number;
  finalLevel: string;
  cta: CTAResult;
  visible: boolean;
  onCtaClick: () => void;
};

export function StickyMiniHeader({ displayIprs, finalLevel, cta, visible, onCtaClick }: StickyMiniHeaderProps) {
  const scrollProgress = useScrollProgress();

  return (
    <div
      class={[
        "fixed inset-x-0 top-0 z-50 bg-bluenavy transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div class="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-8 py-3">
        <div class="flex flex-col gap-1 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-3.5">
          <span class="text-[13px] font-medium text-[rgba(255,255,255,0.8)]">Tu diagnóstico</span>
          <div class="flex items-center gap-2">
            <span class="text-[20px] font-bold text-verde">{displayIprs} / 100</span>
            <span class="rounded-full bg-verde px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-bluenavy">
              {finalLevel}
            </span>
          </div>
        </div>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCtaClick}
          class="press-scale rounded-cta bg-verde px-5 py-2 text-center text-[13px] font-bold text-bluenavy transition-colors duration-150 hover:bg-verde/80"
        >
          {cta.buttonLabel}
        </a>
      </div>
      {/*
        Page scroll-progress fill — replaces the old static border-b-2.
        Solid verde (8.16:1 against bluenavy — the best of the palette's
        accents here) instead of the original verde->azul gradient: at 4px
        tall a two-hue gradient reads as washed-out rather than as a clear
        single-color bar, which is what made it hard to spot.
      */}
      <div class="h-1 w-full bg-[rgba(255,255,255,0.12)]">
        <div class="h-full bg-verde" style={{ width: `${scrollProgress}%` }} />
      </div>
    </div>
  );
}
