import type { DimensionResult } from "../../lib/diagnostic";
import { getDimensionVisual } from "./dimension-visuals";
import { useCountUp, usePrefersReducedMotion } from "./motion";

type DimensionBarProps = {
  dimension: DimensionResult;
  /** True once the dimension-map section has scrolled into view. */
  revealed?: boolean;
  delayMs?: number;
};

export function DimensionBar({ dimension, revealed = true, delayMs = 0 }: DimensionBarProps) {
  const visual = getDimensionVisual(dimension.classification);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animateIn = revealed || prefersReducedMotion;

  const widthPercent = animateIn ? Math.max(0, Math.min(100, dimension.score)) : 0;
  const displayValue = useCountUp(animateIn ? dimension.displayScore : 0, {
    delayMs,
    disabled: prefersReducedMotion,
  });

  return (
    <div class="grid grid-cols-[220px_1fr_36px_100px] items-center gap-3 border-b border-track py-3 max-[599px]:grid-cols-[110px_1fr_32px] max-[599px]:gap-2">
      <span class="text-sm font-medium leading-tight text-acento1">{dimension.name}</span>
      <div class="h-2 overflow-hidden rounded-full bg-track">
        <div
          class={`dimension-bar-fill h-full rounded-full transition-[width] duration-[700ms] ease-[cubic-bezier(.4,0,.2,1)] ${visual.barColorClass}`}
          style={{ width: `${widthPercent}%`, transitionDelay: `${delayMs}ms` }}
        />
      </div>
      <span class="text-right text-[15px] font-bold text-acento1">{displayValue}</span>
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
