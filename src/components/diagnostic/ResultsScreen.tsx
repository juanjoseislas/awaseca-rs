import { useEffect, useRef, useState } from "preact/hooks";
import type { DiagnosticInput, DiagnosticResult } from "../../lib/diagnostic";
import { DIMENSION_IDS, DISCLAIMER_COPY, LEVEL_INTERPRETATION, UNCERTAINTY_COPY } from "../../lib/diagnostic";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import { DimensionBar } from "./DimensionBar";
import { FinalCTASection } from "./FinalCTASection";
import { InsightCard } from "./InsightCard";
import { LevelScale } from "./LevelScale";
import { RecommendationCard } from "./RecommendationCard";
import { ScoreGauge } from "./ScoreGauge";
import { StickyMiniHeader } from "./StickyMiniHeader";
import { Topbar } from "./Topbar";
import { RESULTS_COPY } from "./copy";
import {
  RESULTS_REVEAL_STAGGER,
  revealDelay,
  useCountUp,
  usePrefersReducedMotion,
  useScrollReveal,
} from "./motion";

type ResultsScreenProps = {
  result: DiagnosticResult;
  answers: DiagnosticInput;
  lead: LeadFormValues;
};

export function ResultsScreen({ result }: ResultsScreenProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), {
      rootMargin: "-1px 0px 0px 0px",
    });
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  const handleCtaClick = () => {
    // Phase 3 will wire this to a real booking/contact flow.
    console.info("[diagnostic] CTA clicked", result.cta.route);
  };

  const prefersReducedMotion = usePrefersReducedMotion();
  // Hero is above the fold, so it animates in on mount rather than on
  // scroll — RESULTS_REVEAL_STAGGER.heroVisual times the count-up/gauge to
  // start right as the score number's block finishes fading in.
  const animatedDisplayIprs = useCountUp(result.displayIprs, {
    durationMs: 900,
    delayMs: RESULTS_REVEAL_STAGGER.heroVisual,
    disabled: prefersReducedMotion,
  });

  const uncertaintyReveal = useScrollReveal<HTMLElement>();
  const whatItMeansReveal = useScrollReveal<HTMLElement>();
  const dimensionMapReveal = useScrollReveal<HTMLElement>();
  const strengthsReveal = useScrollReveal<HTMLElement>();
  const gapsReveal = useScrollReveal<HTMLElement>();
  const recommendationsReveal = useScrollReveal<HTMLElement>();

  const levelCopy = LEVEL_INTERPRETATION[result.finalLevel];

  const fallbackTopDimensions =
    result.strengths.length === 0
      ? DIMENSION_IDS.map((id) => result.dimensions[id])
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
      : [];

  // A lone card in a 2-column grid stretches to fill its column, leaving an
  // empty track beside it — cap its width to match a 2-up card and let the
  // section's existing `items-center` center it instead.
  const strengthCardCount = result.strengths.length > 0 ? result.strengths.length : fallbackTopDimensions.length;
  const singleCardGridClass = "mt-9 grid w-full grid-cols-1 gap-6 min-[700px]:max-w-[calc(50%-0.75rem)]";
  const twoUpGridClass = "mt-9 grid w-full grid-cols-1 gap-6 min-[700px]:grid-cols-2";

  return (
    <div class="w-full">
      <Topbar />
      <StickyMiniHeader
        displayIprs={result.displayIprs}
        finalLevel={result.finalLevel}
        cta={result.cta}
        visible={showSticky}
        onCtaClick={handleCtaClick}
      />

      <section ref={heroRef} class="w-full bg-acento1 px-8 pb-14 pt-16">
        <div class="mx-auto flex max-w-[680px] flex-col items-center gap-1 text-center">
          <span
            class="enter-el mb-3 rounded-full bg-verde px-4.5 py-1 text-xs font-bold uppercase tracking-wide text-bluenavy"
            style={{ animationDelay: `${RESULTS_REVEAL_STAGGER.headline}ms` }}
          >
            {result.finalLevel}
          </span>
          <p
            class="enter-el text-[13px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.85)]"
            style={{ animationDelay: `${RESULTS_REVEAL_STAGGER.subhead}ms` }}
          >
            {RESULTS_COPY.hero.levelLabel}
          </p>
          <div
            class="enter-el relative flex h-24 items-baseline justify-center"
            style={{ animationDelay: `${RESULTS_REVEAL_STAGGER.heroVisual}ms` }}
          >
            <span class="text-[96px] font-bold leading-none text-white">{animatedDisplayIprs}</span>
            <span class="ml-1 text-4xl font-normal text-[rgba(255,255,255,0.75)]">/ 100</span>
          </div>
          <div class="enter-el" style={{ animationDelay: `${RESULTS_REVEAL_STAGGER.heroVisual}ms` }}>
            <ScoreGauge score={result.iprs} />
          </div>
          <div class="enter-el" style={{ animationDelay: `${RESULTS_REVEAL_STAGGER.heroVisual}ms` }}>
            <LevelScale iprs={result.iprs} finalLevel={result.finalLevel} />
          </div>
        </div>
      </section>

      {result.uncertaintyFlag ? (
        <section ref={uncertaintyReveal.ref} class="w-full bg-white px-8 pt-8">
          <div
            class={`reveal mx-auto max-w-[680px] rounded-card bg-[#fff8e6] px-6 py-4 text-center ${uncertaintyReveal.revealed ? "reveal-visible" : ""}`}
          >
            <p class="text-sm font-bold text-[#8a6d1f]">{UNCERTAINTY_COPY.title}</p>
            <p class="mt-1 text-sm text-[#8a6d1f]">{UNCERTAINTY_COPY.text}</p>
          </div>
        </section>
      ) : null}

      <section ref={whatItMeansReveal.ref} class="w-full bg-white px-8 py-14">
        <div
          class={`reveal mx-auto flex max-w-[760px] flex-col items-center text-center ${whatItMeansReveal.revealed ? "reveal-visible" : ""}`}
        >
          <span class="text-[11px] font-bold uppercase tracking-wide text-text-eyebrow min-[700px]:text-[13px]">
            {RESULTS_COPY.whatItMeans.eyebrow}
          </span>
          <h2 class="mt-2.5 font-heading text-[32px] font-bold leading-tight text-acento1 min-[700px]:text-[46px]">{levelCopy.title}</h2>
          <div class="mt-7 w-full max-w-[680px] border-l-[3px] border-verde pl-6 text-left">
            <p class="whitespace-pre-line text-lg leading-relaxed text-bluenavy">{levelCopy.text}</p>
          </div>
          {result.whyThisLevel ? (
            <div class="mt-7 w-full max-w-[680px] text-left">
              <h3 class="font-heading text-xl font-bold text-acento1">{RESULTS_COPY.whyThisLevel.title}</h3>
              <p class="mt-2 text-[15px] leading-relaxed text-text-muted">{result.whyThisLevel}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section ref={dimensionMapReveal.ref} class="w-full bg-grey px-8 py-14">
        <div class="mx-auto flex max-w-[840px] flex-col items-center">
          <div
            class={`reveal flex flex-col items-center text-center ${dimensionMapReveal.revealed ? "reveal-visible" : ""}`}
          >
            <span class="text-[11px] font-bold uppercase tracking-wide text-text-eyebrow min-[700px]:text-[13px]">
              {RESULTS_COPY.dimensionMap.eyebrow}
            </span>
            <h2 class="mt-2.5 font-heading text-[34px] font-bold text-acento1 min-[700px]:text-[46px]">{RESULTS_COPY.dimensionMap.title}</h2>
            <p class="mt-2 max-w-[520px] text-[15px] text-text-muted">
              {RESULTS_COPY.dimensionMap.subtitle}
            </p>
          </div>
          <div class="mt-9 flex w-full flex-wrap justify-end gap-5">
            <span class="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span class="size-2.5 rounded-sm bg-verde" /> {RESULTS_COPY.dimensionMap.legend.strength}
            </span>
            <span class="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span class="size-2.5 rounded-sm bg-azul" /> {RESULTS_COPY.dimensionMap.legend.inProgress}
            </span>
            <span class="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span class="size-2.5 rounded-sm bg-acento1/45" /> {RESULTS_COPY.dimensionMap.legend.gap}
            </span>
          </div>
          <div class="mt-2 w-full">
            {DIMENSION_IDS.map((id, index) => (
              <DimensionBar
                key={id}
                dimension={result.dimensions[id]}
                revealed={dimensionMapReveal.revealed}
                delayMs={revealDelay(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section ref={strengthsReveal.ref} class="w-full bg-white px-8 py-14">
        <div class="mx-auto flex max-w-[1100px] flex-col items-center">
          <div
            class={`reveal flex flex-col items-center text-center ${strengthsReveal.revealed ? "reveal-visible" : ""}`}
          >
            {result.strengths.length > 0 ? (
              <>
                <span class="text-[11px] font-bold uppercase tracking-wide text-text-eyebrow min-[700px]:text-[13px]">
                  {RESULTS_COPY.strengths.eyebrow}
                </span>
                <h2 class="mt-2.5 font-heading text-[34px] font-bold text-acento1 min-[700px]:text-[46px]">{RESULTS_COPY.strengths.title}</h2>
              </>
            ) : (
              <>
                <span class="text-[11px] font-bold uppercase tracking-wide text-text-eyebrow min-[700px]:text-[13px]">
                  {RESULTS_COPY.strengths.noStrengths.eyebrow}
                </span>
                <h2 class="mt-2.5 font-heading text-[34px] font-bold text-acento1 min-[700px]:text-[46px]">
                  {RESULTS_COPY.strengths.noStrengths.title}
                </h2>
                <p class="mt-3 max-w-[680px] text-[15px] text-text-muted">
                  {RESULTS_COPY.strengths.noStrengths.subtitle}
                </p>
              </>
            )}
          </div>
          <div class={strengthCardCount === 1 ? singleCardGridClass : twoUpGridClass}>
            {result.strengths.length > 0
              ? result.strengths.map((dimension, index) => (
                  <InsightCard
                    key={dimension.dimensionId}
                    variant="strength"
                    dimension={dimension}
                    revealed={strengthsReveal.revealed}
                    delayMs={revealDelay(index)}
                  />
                ))
              : fallbackTopDimensions.map((dimension, index) => (
                  <InsightCard
                    key={dimension.dimensionId}
                    variant="reference"
                    referenceContext="strengths"
                    dimension={dimension}
                    revealed={strengthsReveal.revealed}
                    delayMs={revealDelay(index)}
                  />
                ))}
          </div>
        </div>
      </section>

      <section ref={gapsReveal.ref} class="w-full bg-grey px-8 py-14">
        <div class="mx-auto flex max-w-[1100px] flex-col items-center">
          <div class={`reveal text-center ${gapsReveal.revealed ? "reveal-visible" : ""}`}>
            <span class="text-[11px] font-bold uppercase tracking-wide text-text-eyebrow min-[700px]:text-[13px]">
              {result.gapsScenario === "gaps" ? RESULTS_COPY.gaps.eyebrow : RESULTS_COPY.gaps.consolidationEyebrow}
            </span>
            <h2 class="mt-2.5 font-heading text-[34px] font-bold text-acento1 min-[700px]:text-[46px]">
              {result.gapsScenario === "gaps" ? RESULTS_COPY.gaps.title : RESULTS_COPY.gaps.consolidationTitle}
            </h2>
          </div>
          <div class={result.gaps.length === 1 ? singleCardGridClass : twoUpGridClass}>
            {result.gaps.map((dimension, index) => (
              <InsightCard
                key={dimension.dimensionId}
                variant={result.gapsScenario === "gaps" ? "gap" : "reference"}
                referenceContext="gaps"
                dimension={dimension}
                revealed={gapsReveal.revealed}
                delayMs={revealDelay(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section ref={recommendationsReveal.ref} class="w-full bg-acento1 px-8 py-14">
        <div class="mx-auto flex max-w-[800px] flex-col items-center">
          <div class={`reveal text-center ${recommendationsReveal.revealed ? "reveal-visible" : ""}`}>
            <span class="text-[11px] font-bold uppercase tracking-wide text-[rgba(255,255,255,0.85)] min-[700px]:text-[13px]">
              {RESULTS_COPY.recommendations.eyebrow}
            </span>
            <h2 class="mt-2.5 font-heading text-[42px] font-bold text-white min-[700px]:text-[46px]">{RESULTS_COPY.recommendations.title}</h2>
          </div>
          <div class="mt-10 flex w-full flex-col gap-3.5">
            {result.recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                index={index}
                revealed={recommendationsReveal.revealed}
              />
            ))}
          </div>
        </div>
      </section>

      <FinalCTASection
        cta={result.cta}
        finalLevel={result.finalLevel}
        displayIprs={result.displayIprs}
        onCtaClick={handleCtaClick}
      />

      <footer class="w-full bg-grey px-8 py-8 text-center">
        <p class="text-xs font-bold uppercase tracking-wide text-text-muted">{DISCLAIMER_COPY.title}</p>
        <p class="mx-auto mt-2 max-w-[680px] text-xs text-text-muted">{DISCLAIMER_COPY.text}</p>
      </footer>
    </div>
  );
}
