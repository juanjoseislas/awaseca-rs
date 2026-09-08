import type { CTAResult } from "../../lib/diagnostic";
import { BOOKING_URL } from "./copy";

type StickyMiniHeaderProps = {
  displayIprs: number;
  finalLevel: string;
  cta: CTAResult;
  visible: boolean;
  onCtaClick: () => void;
};

export function StickyMiniHeader({ displayIprs, finalLevel, cta, visible, onCtaClick }: StickyMiniHeaderProps) {
  return (
    <div
      class={[
        "fixed inset-x-0 top-0 z-50 border-b-2 border-verde bg-bluenavy transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div class="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-3">
        <div class="flex items-center gap-3.5">
          <span class="text-[13px] font-medium text-[rgba(255,255,255,0.8)]">Tu diagnóstico</span>
          <span class="text-[20px] font-bold text-verde">{displayIprs} / 100</span>
          <span class="rounded-full bg-verde px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-bluenavy">
            {finalLevel}
          </span>
        </div>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCtaClick}
          class="rounded-cta bg-verde px-5 py-2 text-[13px] font-bold text-bluenavy"
        >
          {cta.buttonLabel}
        </a>
      </div>
    </div>
  );
}
