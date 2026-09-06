import type { DiagnosticInput } from "../../lib/diagnostic";
import { mergeQ1Objectives } from "../../lib/diagnostic/domain/merge-q1-objectives";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import { COMPANY_SIZE_OPTIONS, RESULTS_COPY } from "./copy";

type CompanyContextCardProps = {
  lead: LeadFormValues;
  answers: DiagnosticInput;
};

/**
 * Narrative + tag chips synthesized from lead data + Q1 objectives
 * (decision #5 in the plan) — no location/country field, since our lead
 * form doesn't collect one.
 */
export function CompanyContextCard({ lead, answers }: CompanyContextCardProps) {
  const sizeOption = COMPANY_SIZE_OPTIONS.find((option) => option.id === lead.companySize);
  const objectives = mergeQ1Objectives(answers.q1);
  const hasIfrsObjective = answers.q1.some((answer) => answer.optionId === "q1_ifrs");

  const narrative = [
    sizeOption && lead.industry
      ? `${sizeOption.narrativePhrase} del sector ${lead.industry.toLowerCase()}.`
      : null,
    objectives.length > 0
      ? `Su principal motivación con este diagnóstico: ${objectives.join(", ").toLowerCase()}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const chips = [lead.industry, sizeOption?.label, hasIfrsObjective ? "NIIF S1 / S2" : null].filter(
    (chip): chip is string => Boolean(chip),
  );

  return (
    <div class="mx-auto flex max-w-[800px] flex-col items-start gap-5">
      <div class="w-full text-center">
        <span class="text-[11px] font-bold uppercase tracking-wide text-text-eyebrow">
          {RESULTS_COPY.companyContext.eyebrow}
        </span>
        <h2 class="mt-2 font-heading text-2xl font-bold text-acento1">{RESULTS_COPY.companyContext.title}</h2>
      </div>
      {narrative ? (
        <div class="w-full rounded-card border-l-[3px] border-azul bg-grey px-8 py-7">
          <p class="text-[17px] text-acento1">{narrative}</p>
        </div>
      ) : null}
      {chips.length > 0 ? (
        <div class="flex flex-wrap gap-2.5">
          {chips.map((chip) => (
            <span
              key={chip}
              class="rounded-full bg-acento1 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
