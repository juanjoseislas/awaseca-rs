import type { Level } from "../../lib/diagnostic";
import { LEVELS } from "../../lib/diagnostic";
import { LEVEL_THRESHOLDS } from "../../lib/diagnostic/config/levels";
import markerIconUrl from "../../assets/diagnostic/level-marker-icon.svg?url";
import { RESULTS_COPY } from "./copy";

type LevelScaleProps = {
  iprs: number;
  finalLevel: Level;
};

function nextThresholdFor(level: Level): number | null {
  switch (level) {
    case "Inicial":
      return LEVEL_THRESHOLDS.enDesarrollo;
    case "En desarrollo":
      return LEVEL_THRESHOLDS.preparada;
    case "Preparada":
      return LEVEL_THRESHOLDS.avanzada;
    case "Avanzada":
      return null;
  }
}

export function LevelScale({ iprs, finalLevel }: LevelScaleProps) {
  const activeIndex = LEVELS.indexOf(finalLevel);
  const nextThreshold = nextThresholdFor(finalLevel);
  const nextLevel = nextThreshold !== null ? LEVELS[activeIndex + 1] : null;
  const pointsToNext = nextThreshold !== null ? Math.max(0, Math.ceil(nextThreshold - iprs)) : 0;

  return (
    <div class="mx-auto flex w-full max-w-[400px] flex-col items-center gap-2">
      <div class="relative w-full">
        <img
          src={markerIconUrl}
          alt=""
          class="absolute -top-2 h-2 w-2.5 -translate-x-1/2"
          style={{ left: `${Math.max(0, Math.min(100, iprs))}%` }}
        />
        <div class="flex gap-1 pt-3">
          {LEVELS.map((level, index) => (
            <div
              key={level}
              class="h-[5px] flex-1 rounded-[3px]"
              style={{ background: index === activeIndex ? "#66cc99" : "rgba(255,255,255,0.28)" }}
            />
          ))}
        </div>
      </div>
      <div class="flex w-full gap-1">
        {LEVELS.map((level, index) => (
          <span
            key={level}
            class={[
              "flex-1 text-center text-[13px] uppercase tracking-wide",
              index === activeIndex ? "font-bold text-white" : "text-[rgba(255,255,255,0.82)]",
            ].join(" ")}
          >
            {level}
          </span>
        ))}
      </div>
      <p class="pt-2 text-center text-[13px] text-[rgba(255,255,255,0.85)]">
        {nextLevel
          ? RESULTS_COPY.hero.pointsToNext(pointsToNext, nextLevel)
          : RESULTS_COPY.hero.maxLevelReached}
      </p>
    </div>
  );
}
