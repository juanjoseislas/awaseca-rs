import { useEffect, useRef, useState } from "preact/hooks";

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

/** Per-card stagger for a scroll-revealed group (slower cascade than listItemDelay's form-field pace). */
export function revealDelay(index: number): number {
  return index * 110;
}

/**
 * Fires once when `ref`'s element first enters the viewport, then stops
 * observing — reveals should play once, not re-trigger on scroll back up.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

/**
 * Counts 0 -> target over `durationMs`, optionally delayed. `disabled`
 * (feed it usePrefersReducedMotion()) skips straight to `target`.
 */
export function useCountUp(
  target: number,
  options: { durationMs?: number; delayMs?: number; disabled?: boolean; round?: boolean } = {},
): number {
  const { durationMs = 900, delayMs = 0, disabled = false, round = true } = options;
  const [value, setValue] = useState(disabled ? target : 0);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }

    let frameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        const raw = target * progress;
        setValue(round ? Math.round(raw) : raw);
        if (progress < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    };

    timeoutId = setTimeout(animate, delayMs);
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
    };
  }, [target, durationMs, delayMs, disabled, round]);

  return value;
}

/** 0-100 page scroll progress — used only by the sticky header's progress bar. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const compute = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return progress;
}
