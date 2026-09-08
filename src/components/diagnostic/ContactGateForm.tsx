import type { ComponentChildren } from "preact";
import type { LeadFormValues } from "../../lib/diagnostic-submission";
import { COMPANY_SIZE_OPTIONS, LEAD_GATE_COPY } from "./copy";
import type { LeadFormErrors, SubmissionStatus } from "./types";
import { FIELD_MAX_LENGTHS } from "./validation";

type ContactGateFormProps = {
  values: LeadFormValues;
  errors: LeadFormErrors;
  submission: SubmissionStatus;
  onChange: (field: keyof LeadFormValues, value: string) => void;
  onSubmit: () => void;
};

function fieldClass(hasError: boolean): string {
  return [
    "w-full rounded-button border-[1.5px] px-4 py-3 text-base text-acento1 outline-none transition-colors",
    hasError ? "border-[#c0392b] focus:border-[#c0392b]" : "border-[#e2e2e2] focus:border-azul",
  ].join(" ");
}

function Field({
  label,
  required,
  error,
  children,
  full,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ComponentChildren;
  full?: boolean;
}) {
  return (
    <label class={`flex flex-col gap-1 text-sm font-medium text-acento1 ${full ? "min-[600px]:col-span-2" : ""}`}>
      <span>
        {label}
        {required ? <span class="ml-0.5 text-[#c0392b]">*</span> : null}
      </span>
      {children}
      {error ? <span class="text-xs font-normal text-[#c0392b]">{error}</span> : null}
    </label>
  );
}

export function ContactGateForm({ values, errors, submission, onChange, onSubmit }: ContactGateFormProps) {
  const isSubmitting = submission === "submitting";
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div class="enter-el mx-auto flex max-w-[760px] flex-col gap-6 px-4 py-12">
      <div class="text-center">
        <span class="rounded-full bg-cell-green px-4 py-1 text-xs font-bold uppercase tracking-wide text-text-eyebrow">
          {LEAD_GATE_COPY.eyebrow}
        </span>
        <h1 class="mt-3 font-heading text-2xl font-bold text-acento1">{LEAD_GATE_COPY.title}</h1>
        <p class="mt-2 whitespace-pre-line text-base text-text-muted">{LEAD_GATE_COPY.body}</p>
      </div>

      <p class="text-center text-xs text-text-muted">{LEAD_GATE_COPY.requiredFieldsNote}</p>

      {hasErrors ? (
        <p class="rounded-button bg-[#fdecea] px-4 py-3 text-center text-sm font-medium text-[#c0392b]">
          {LEAD_GATE_COPY.incompleteFormMessage}
        </p>
      ) : null}

      <form
        class="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field label={LEAD_GATE_COPY.fields.firstName} required error={errors.firstName}>
          <input
            class={fieldClass(Boolean(errors.firstName))}
            value={values.firstName}
            maxLength={FIELD_MAX_LENGTHS.firstName}
            onInput={(e) => onChange("firstName", (e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label={LEAD_GATE_COPY.fields.lastName} required error={errors.lastName}>
          <input
            class={fieldClass(Boolean(errors.lastName))}
            value={values.lastName}
            maxLength={FIELD_MAX_LENGTHS.lastName}
            onInput={(e) => onChange("lastName", (e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label={LEAD_GATE_COPY.fields.email} required error={errors.email}>
          <input
            type="email"
            class={fieldClass(Boolean(errors.email))}
            value={values.email}
            maxLength={FIELD_MAX_LENGTHS.email}
            onInput={(e) => onChange("email", (e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label={LEAD_GATE_COPY.fields.jobTitle} required error={errors.jobTitle}>
          <input
            class={fieldClass(Boolean(errors.jobTitle))}
            value={values.jobTitle}
            maxLength={FIELD_MAX_LENGTHS.jobTitle}
            onInput={(e) => onChange("jobTitle", (e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label={LEAD_GATE_COPY.fields.companySize} required error={errors.companySize}>
          <select
            class={fieldClass(Boolean(errors.companySize))}
            value={values.companySize}
            onChange={(e) => onChange("companySize", (e.target as HTMLSelectElement).value)}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={LEAD_GATE_COPY.fields.industry} required error={errors.industry}>
          <input
            class={fieldClass(Boolean(errors.industry))}
            value={values.industry}
            maxLength={FIELD_MAX_LENGTHS.industry}
            onInput={(e) => onChange("industry", (e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label={LEAD_GATE_COPY.fields.company} required error={errors.company} full>
          <input
            class={fieldClass(Boolean(errors.company))}
            value={values.company}
            maxLength={FIELD_MAX_LENGTHS.company}
            onInput={(e) => onChange("company", (e.target as HTMLInputElement).value)}
          />
        </Field>
        <Field label={LEAD_GATE_COPY.fields.phone} error={errors.phone} full>
          <input
            type="tel"
            inputMode="numeric"
            class={fieldClass(Boolean(errors.phone))}
            value={values.phone ?? ""}
            maxLength={FIELD_MAX_LENGTHS.phone}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              const digitsOnly = target.value.replace(/\D/g, "");
              if (digitsOnly !== target.value) target.value = digitsOnly;
              onChange("phone", digitsOnly);
            }}
          />
        </Field>

        <div class="min-[600px]:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            class="press-scale w-full rounded-button bg-acento1 px-8 py-4 text-base font-bold text-white shadow-[0_0_0_rgba(64,104,130,0)] transition-[background-color,box-shadow] duration-300 hover:bg-[#345266] hover:shadow-[0_10px_22px_rgba(64,104,130,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? LEAD_GATE_COPY.submittingLabel : LEAD_GATE_COPY.submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
