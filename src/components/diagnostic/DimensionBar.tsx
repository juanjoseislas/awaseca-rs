import type { DimensionResult } from "../../lib/diagnostic";
import { getDimensionVisual } from "./dimension-visuals";

type DimensionBarProps = {
  dimension: DimensionResult;
};

export function DimensionBar({ dimension }: DimensionBarProps) {
  const visual = getDimensionVisual(dimension.classification);

  return (
    <div class="grid grid-cols-[220px_1fr_36px_100px] items-center gap-3 border-b border-track py-3 max-[599px]:grid-cols-[110px_1fr_32px] max-[599px]:gap-2">
      <span class="text-sm font-medium leading-tight text-acento1">{dimension.name}</span>
      <div class="h-2 overflow-hidden rounded-full bg-track">
        <div class={`h-full rounded-full ${visual.barColorClass}`} style={{ width: `${Math.max(0, Math.min(100, dimension.score))}%` }} />
      </div>
      <span class="text-right text-[15px] font-bold text-acento1">{dimension.displayScore}</span>
      {visual.pillLabel ? (
        <span
          class={`w-fit justify-self-start rounded-button px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide max-[599px]:hidden ${visual.pillClassName}`}
        >
          {visual.pillLabel}
        </span>
      ) : (
        <span class="max-[599px]:hidden" />
      )}
    </div>
  );
}
