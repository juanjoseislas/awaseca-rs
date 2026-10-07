import type { DiagnosticResult } from "../diagnostic";
import type { LeadFormValues } from "../diagnostic-submission";

/**
 * This file — like diagnostic-submission.ts — owns a side effect (an
 * outbound HTTP call), kept out of src/lib/diagnostic/ so the engine
 * stays pure. Talks directly to Resend's HTTP API via `fetch` (no SDK
 * dependency — `fetch` is a Workers global, same approach the Supabase
 * client already relies on implicitly).
 */

export type SendInterpretationEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  lead: LeadFormValues;
  result: DiagnosticResult;
  markdown: string;
  attachmentFilename: string;
};

export type SendInterpretationEmailOutcome = { ok: true } | { ok: false; error: string };

function toBase64(text: string): string {
  // btoa is UTF-16-unsafe; encode as UTF-8 bytes first so accented
  // Spanish copy in the markdown round-trips correctly as an attachment.
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Emails the generated interpretation to the sales team. Never throws —
 * a notification failure must never block the diagnostic response the
 * lead is waiting on (same contract as saveDiagnosticSubmission).
 */
export async function sendInterpretationEmail(
  input: SendInterpretationEmailInput,
): Promise<SendInterpretationEmailOutcome> {
  try {
    const { apiKey, from, to, lead, result, markdown, attachmentFilename } = input;
    const subject = `Nuevo diagnóstico: ${lead.company} — Nivel ${result.finalLevel} (IPRS ${result.displayIprs})`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: markdown,
        attachments: [{ filename: attachmentFilename, content: toBase64(markdown) }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[notify] Resend request failed", response.status, body);
      return { ok: false, error: `resend_http_${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("[notify] Resend request threw", error);
    return { ok: false, error: "network_error" };
  }
}
