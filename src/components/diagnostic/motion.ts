import { useEffect, useState } from "preact/hooks";

/** From step-transition-animation-spec.md — apply as-is, do not retune per-screen. */
export const MOTION = {
  exitDurationMs: 160,
  enterDurationMs: 280,
  stagger: {
    eyebrow: 0,
    title: 30,
    subtext: 55,
    listItemBase: 65,
    listItemStep: 25,
  },
} as const;

export function listItemDelay(index: number): number {
  return MOTION.stagger.listItemBase + MOTION.stagger.listItemStep * index;
}

/** One-time results reveal is allowed to be slower/more theatrical (spec's stated exception). */
export const RESULTS_REVEAL_STAGGER = {
  headline: 60,
  subhead: 110,
  heroVisual: 160,
} as const;

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return prefersReduced;
}
