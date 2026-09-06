import type { DiagnosticInput } from "./diagnostic";
import type { WizardScreen } from "../components/diagnostic/types";

const STORAGE_KEY = "awaseca.diagnostic.progress.v1";
const SCHEMA_VERSION = 1;
const DEBOUNCE_MS = 400;

export type PersistedProgress = {
  schemaVersion: typeof SCHEMA_VERSION;
  updatedAt: string;
  screen: WizardScreen;
  questionIndex: number;
  answers: Partial<DiagnosticInput>;
};

let pendingWrite: PersistedProgress | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function flushPendingWrite(): void {
  if (!pendingWrite) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingWrite));
  } catch (error) {
    console.warn("[diagnostic] could not persist progress to localStorage", error);
  } finally {
    pendingWrite = null;
  }
}

/**
 * Debounced write — collapses rapid calls (e.g. Q17 keystrokes) into one
 * localStorage.setItem after a short pause. Guarded so private
 * browsing/quota errors never crash the quiz.
 */
export function saveProgress(
  progress: Omit<PersistedProgress, "schemaVersion" | "updatedAt">,
): void {
  pendingWrite = {
    ...progress,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushPendingWrite, DEBOUNCE_MS);
}

export function loadProgress(): PersistedProgress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedProgress;
    if (parsed?.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed;
  } catch (error) {
    console.warn("[diagnostic] could not read progress from localStorage", error);
    return null;
  }
}

export function clearProgress(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingWrite = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[diagnostic] could not clear progress from localStorage", error);
  }
}
