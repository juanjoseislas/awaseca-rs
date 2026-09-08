import type { DimensionClassification, DimensionId } from "../../lib/diagnostic";
import checkIconUrl from "../../assets/diagnostic/check-icon.svg?url";
import warnIconUrl from "../../assets/diagnostic/warn-icon.svg?url";
import { DIMENSION_INSIGHT_COPY, REFERENCE_CARD_COPY } from "./copy";
import { getDimensionVisual } from "./dimension-visuals";

type DimensionLike = {
  dimensionId: DimensionId;
  name: string;
  score: number;
  displayScore: number;
  classification: DimensionClassification;
};

type InsightCardProps = {
  /**
   * "strength"/"gap": a real strength or gap per the closed spec's rules.
   * "reference": the §21/§22 fallback — shown only as a comparative data
   * point, never labeled a strength or gap, real classification preserved.
   */
  variant: "strength" | "gap" | "reference";
  /**
   * Which list a "reference" card appears in — picks the right neutral
   * copy ("one of your better areas" vs "lowest relative score, still
   * solid overall"). Independent of the dimension's actual score: e.g.
   * the gaps-consolidation list can contain a 100-scoring dimension that
   * is still framed as "comparatively lower" within that list.
   */
  referenceContext?: "strengths" | "gaps";
  dimension: DimensionLike;
  /** True once the parent section has scrolled into view. */
  revealed?: boolean;
  delayMs?: number;
};

export function InsightCard({
  variant,
  referenceContext,
  dimension,
  revealed = true,
  delayMs = 0,
}: InsightCardProps) {
  const isReference = variant === "reference";
  const isPositive = isReference ? dimension.score >= 70 : variant === "strength";

  const icon = isPositive ? checkIconUrl : warnIconUrl;
  const accentColorClass = isPositive ? "text-verde" : "text-azul";
  // Reference cards (the §21/§22 fallback) always get a neutral track-colored
  // border — never the verde/azul accent — so they can never be mistaken for
  // a real strength or gap card, even when the icon/score happen to align.
  const borderColorClass = isReference ? "border-track" : isPositive ? "border-verde" : "border-azul";
  const bgColorClass = isPositive && !isReference ? "bg-grey" : "bg-white";

  const description = isReference
    ? referenceContext === "gaps"
      ? REFERENCE_CARD_COPY.consolidationOpportunity
      : REFERENCE_CARD_COPY.higherPreparedness
    : DIMENSION_INSIGHT_COPY[dimension.dimensionId][variant === "strength" ? "strength" : "gap"];

  const visual = isReference ? getDimensionVisual(dimension.classification) : null;

  return (
    <div
      class={`reveal-scale hover-lift flex flex-col gap-3.5 rounded-card border-t-[3px] p-7 shadow-[0_1px_2px_rgba(64,104,130,0.06)] ${revealed ? "reveal-visible" : ""} ${borderColorClass} ${bgColorClass}`}
      style={{ "--reveal-delay": `${delayMs}ms` }}
    >
      <div class="flex items-center justify-between">
        <img src={icon} alt="" class="size-8" />
        <span class={`text-[28px] font-bold tracking-tight ${accentColorClass}`}>{dimension.displayScore}</span>
      </div>
      <p class="text-[19px] font-bold text-acento1">{dimension.name}</p>
      <p class="text-[15px] text-text-muted">{description}</p>
      {isReference && visual ? (
        <span class="w-fit rounded-button border border-track px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
          {dimension.classification}
        </span>
      ) : null}
    </div>
  );
}
