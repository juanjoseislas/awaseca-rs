import type { Recommendation } from "../../lib/diagnostic";
import { getRecommendationBadge } from "./recommendation-badge";
import { revealDelay } from "./motion";

type RecommendationCardProps = {
  recommendation: Recommendation;
  index: number;
  /** True once the parent section has scrolled into view. */
  revealed?: boolean;
};

export function RecommendationCard({ recommendation, index, revealed = true }: RecommendationCardProps) {
  const badge = getRecommendationBadge(recommendation.id);
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      class={`reveal hover-lift flex w-full gap-5 rounded-card border-l-[3px] border-verde bg-[rgba(255,255,255,0.08)] px-7 py-6 ${revealed ? "reveal-visible" : ""}`}
      style={{ "--reveal-delay": `${revealDelay(index)}ms` }}
    >
      <span class="shrink-0 text-[44px] font-extralight leading-none text-[rgba(255,255,255,0.45)]">
        {number}
      </span>
      <div class="flex flex-1 flex-col gap-3">
        {/* Title + description are one visual block (tight spacing, close
            opacity) since Figma's mockup has one sentence per card but our
            real content splits into a short title + longer description. */}
        <div class="flex flex-col gap-1">
          <p class="text-base leading-[26.4px] text-white">{recommendation.title}</p>
          <p class="text-base leading-[26.4px] text-[rgba(255,255,255,0.85)]">
            {recommendation.description}
          </p>
        </div>
        <span class="w-fit rounded-button bg-verde px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-bluenavy">
          {badge}
        </span>
      </div>
    </div>
  );
}
