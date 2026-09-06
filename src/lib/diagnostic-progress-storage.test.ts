import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProgress, loadProgress, saveProgress } from "./diagnostic-progress-storage";

function createMemoryLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
}

describe("diagnostic-progress-storage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { localStorage: createMemoryLocalStorage() });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns null when nothing has been saved", () => {
    expect(loadProgress()).toBeNull();
  });

  it("round-trips a saved progress record after the debounce window", () => {
    saveProgress({ screen: "question", questionIndex: 4, answers: { q1: [] } });
    vi.advanceTimersByTime(500);

    const loaded = loadProgress();
    expect(loaded).not.toBeNull();
    expect(loaded?.schemaVersion).toBe(1);
    expect(loaded?.screen).toBe("question");
    expect(loaded?.questionIndex).toBe(4);
    expect(typeof loaded?.updatedAt).toBe("string");
  });

  it("collapses rapid successive writes into a single persisted value", () => {
    saveProgress({ screen: "question", questionIndex: 1, answers: {} });
    vi.advanceTimersByTime(100);
    saveProgress({ screen: "question", questionIndex: 2, answers: {} });
    vi.advanceTimersByTime(100);
    saveProgress({ screen: "question", questionIndex: 3, answers: {} });
    vi.advanceTimersByTime(500);

    expect(loadProgress()?.questionIndex).toBe(3);
  });

  it("discards a record with a mismatched schema version", () => {
    saveProgress({ screen: "question", questionIndex: 4, answers: {} });
    vi.advanceTimersByTime(500);

    const raw = (window as unknown as { localStorage: Storage }).localStorage.getItem(
      "awaseca.diagnostic.progress.v1",
    );
    const tampered = { ...JSON.parse(raw!), schemaVersion: 999 };
    (window as unknown as { localStorage: Storage }).localStorage.setItem(
      "awaseca.diagnostic.progress.v1",
      JSON.stringify(tampered),
    );

    expect(loadProgress()).toBeNull();
  });

  it("clearProgress removes the saved record and cancels a pending debounced write", () => {
    saveProgress({ screen: "question", questionIndex: 4, answers: {} });
    clearProgress();
    vi.advanceTimersByTime(500);

    expect(loadProgress()).toBeNull();
  });
});
