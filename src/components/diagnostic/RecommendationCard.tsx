import type { Recommendation } from "../../lib/diagnostic";
import { getRecommendationBadge } from "./recommendation-badge";

type RecommendationCardProps = {
  recommendation: Recommendation;
  index: number;
};

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const badge = getRecommendationBadge(recommendation.id);
  const number = String(index + 1).padStart(2, "0");

  return (
    <div class="flex w-full gap-5 rounded-card border-l-[3px] border-verde bg-[rgba(255,255,255,0.08)] px-7 py-6">
      <span class="shrink-0 text-[44px] font-extralight leading-none text-[rgba(255,255,255,0.45)]">
        {number}
      </span>
      <div class="flex flex-1 flex-col gap-2.5">
        <p class="text-base text-white">{recommendation.title}</p>
        <p class="text-sm text-[rgba(255,255,255,0.75)]">{recommendation.description}</p>
        <span class="w-fit rounded-button bg-verde px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-bluenavy">
          {badge}
        </span>
      </div>
    </div>
  );
}
