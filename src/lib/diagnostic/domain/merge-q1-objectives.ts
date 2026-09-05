import { Q1_CONCEPTS } from "../config/q1-personalization";
import type { Answer } from "../types";

/**
 * Normalizes a concept phrase down to its leading keyword (accent-stripped,
 * lowercased) so near-duplicate concepts collapse to one — e.g.
 * "Información" and "Información solicitada por clientes" both key to
 * "informacion". Cheap but effective given the small, hand-authored
 * vocabulary of section 27's concept lists.
 */
function conceptKey(concept: string): string {
  return concept
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/)[0];
}

/**
 * Merges the priority concepts of 1–2 selected Q1 objectives with equal
 * weight, deduplicating semantically equivalent concepts (spec §27).
 * Never used to change CTA route, IPRS, dimensions, or level.
 */
export function mergeQ1Objectives(q1: Answer[]): string[] {
  const conceptLists = q1.map((answer) => Q1_CONCEPTS[answer.optionId] ?? []);
  const maxLength = Math.max(0, ...conceptLists.map((list) => list.length));

  const interleaved: string[] = [];
  for (let index = 0; index < maxLength; index += 1) {
    for (const list of conceptLists) {
      if (list[index]) interleaved.push(list[index]);
    }
  }

  const seenKeys = new Set<string>();
  const merged: string[] = [];
  for (const concept of interleaved) {
    const key = conceptKey(concept);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    merged.push(concept);
  }

  return merged;
}
