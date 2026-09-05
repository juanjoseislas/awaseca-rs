/** ((obtainedScore - minimumScore) / (maximumScore - minimumScore)) * 100 (spec §11). */
export function normalizeDimension(
  obtainedScore: number,
  minimumScore: number,
  maximumScore: number,
): number {
  return ((obtainedScore - minimumScore) / (maximumScore - minimumScore)) * 100;
}
