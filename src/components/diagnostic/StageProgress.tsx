import { STAGE_LABELS } from "./copy";

export type Stage = "perfil" | "diagnostico" | "contacto";

const STAGES: Stage[] = ["perfil", "diagnostico", "contacto"];

type StageProgressProps = {
  activeStage: Stage;
  /** 0-100 fill for the currently active stage's segment. Completed stages render at 100. */
  activeStageProgress: number;
  caption?: string | null;
};

export function StageProgress({ activeStage, activeStageProgress, caption }: StageProgressProps) {
  const activeIndex = STAGES.indexOf(activeStage);

  return (
    <div class="mx-auto w-full">
      <div class="flex items-center justify-between">
        {STAGES.map((stage, index) => {
          const status = index < activeIndex ? "completed" : index === activeIndex ? "active" : "upcoming";
          const colorClass =
            status === "completed" ? "text-verde" : status === "active" ? "text-acento1" : "text-silver";
          return (
            <span
              key={stage}
              class={`text-[11px] font-semibold uppercase tracking-wide min-[600px]:text-[13px] ${colorClass}`}
            >
              {STAGE_LABELS[stage]}
            </span>
          );
        })}
      </div>
      <div class="mt-2 flex gap-1">
        {STAGES.map((stage, index) => {
          const fillPercent = index < activeIndex ? 100 : index === activeIndex ? activeStageProgress : 0;
          return (
            <div key={stage} class="h-[5px] flex-1 overflow-hidden rounded-[10px] bg-track">
              <div
                class="h-full rounded-[10px] bg-gradient-to-r from-verde to-azul transition-[width] duration-[450ms] ease-[cubic-bezier(.4,0,.2,1)]"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          );
        })}
      </div>
      {caption ? <p class="mt-2 text-center text-[14px] text-text-muted">{caption}</p> : null}
    </div>
  );
}
