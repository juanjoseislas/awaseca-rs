import { SALES_INSIGHT_RULES } from "../config/sales-insights";
import type { SalesInsightContext } from "../types";

/**
 * Evaluates the sales-insight catalog against the given context and
 * returns the matching bullet texts, in catalog order. No cap needed —
 * the catalog has exactly 5 independent rules (approved spec,
 * 2026-10-05), so at most all 5 can ever be returned.
 */
export function generateSalesInsights(context: SalesInsightContext): string[] {
  return SALES_INSIGHT_RULES.filter((rule) => rule.condition(context)).map((rule) =>
    rule.text(context),
  );
}
