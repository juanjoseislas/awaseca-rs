import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildInput, TIER1_OPTIONS } from "../../lib/diagnostic/test-fixtures";
import type { LeadFormValues } from "../../lib/diagnostic-submission";

type InsertError = { message: string; code?: string } | null;

const VALID_ENV = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_SECRET_KEY: "test-service-role-key",
  RESEND_API_KEY: "test-resend-key",
  RESEND_FROM_EMAIL: "Awaseca <diagnosticos@awaseca.com>",
  SALES_NOTIFICATION_EMAIL: "ventas@awaseca.com",
};

const { insertMock, fromMock, createClientMock, mockEnv, rateLimiterMock, buildInterpretationMarkdownMock } =
  vi.hoisted(() => {
    const insertMock = vi.fn(async (_row: Record<string, unknown>): Promise<{ error: InsertError }> => ({
      error: null,
    }));
    const fromMock = vi.fn(() => ({ insert: insertMock }));
    const createClientMock = vi.fn(() => ({ from: fromMock }));
    const rateLimiterMock = vi.fn(async (_options: { key: string }): Promise<{ success: boolean }> => ({
      success: true,
    }));
    const buildInterpretationMarkdownMock = vi.fn();
    const mockEnv: Record<string, unknown> = {};
    return { insertMock, fromMock, createClientMock, mockEnv, rateLimiterMock, buildInterpretationMarkdownMock };
  });

vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));
// Astro's `locals.runtime.env` was removed in favor of this Cloudflare
// Workers runtime module — mock it the same way the real route reads it.
vi.mock("cloudflare:workers", () => ({ env: mockEnv }));
// Wraps the real builder by default (set below) so every existing test
// still gets real markdown — only the one test that overrides this with
// `mockImplementationOnce` exercises the failure path.
vi.mock("../../lib/diagnostic/report/build-interpretation-markdown", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lib/diagnostic/report/build-interpretation-markdown")>();
  buildInterpretationMarkdownMock.mockImplementation(actual.buildInterpretationMarkdown);
  return { ...actual, buildInterpretationMarkdown: buildInterpretationMarkdownMock };
});

const { POST } = await import("./submit-diagnostic");

const VALID_LEAD: LeadFormValues = {
  firstName: "Ana",
  lastName: "Pérez",
  email: "ana@example.com",
  company: "Acme",
  jobTitle: "CEO",
  companySize: "small",
  industry: "Tecnología",
};

function makeRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request("http://localhost/api/submit-diagnostic", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeContext(body: unknown, headers?: Record<string, string>) {
  return { request: makeRequest(body, headers) } as never;
}

async function readJson(response: Response): Promise<any> {
  return response.json();
}

const fetchMock = vi.fn(
  async (_url: string, _init?: RequestInit): Promise<Response> =>
    new Response(JSON.stringify({ id: "email_123" }), { status: 200 }),
);

describe("POST /api/submit-diagnostic", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
    createClientMock.mockClear();
    insertMock.mockResolvedValue({ error: null });
    rateLimiterMock.mockClear();
    rateLimiterMock.mockResolvedValue({ success: true });
    buildInterpretationMarkdownMock.mockClear();
    fetchMock.mockClear();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    mockEnv.SUPABASE_URL = VALID_ENV.SUPABASE_URL;
    mockEnv.SUPABASE_SECRET_KEY = VALID_ENV.SUPABASE_SECRET_KEY;
    mockEnv.SUBMIT_DIAGNOSTIC_LIMITER = { limit: rateLimiterMock };
    mockEnv.RESEND_API_KEY = VALID_ENV.RESEND_API_KEY;
    mockEnv.RESEND_FROM_EMAIL = VALID_ENV.RESEND_FROM_EMAIL;
    mockEnv.SALES_NOTIFICATION_EMAIL = VALID_ENV.SALES_NOTIFICATION_EMAIL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("saves a valid submission and returns 200", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ ok: true });
    expect(createClientMock).toHaveBeenCalledWith(
      VALID_ENV.SUPABASE_URL,
      VALID_ENV.SUPABASE_SECRET_KEY,
      expect.any(Object),
    );
    expect(fromMock).toHaveBeenCalledWith("diagnostic_submissions");
    expect(insertMock).toHaveBeenCalledTimes(1);

    const insertedRow = insertMock.mock.calls[0][0];
    expect(insertedRow.lead_email).toBe("ana@example.com");
    expect(insertedRow.lead_first_name).toBe("Ana");
    expect(insertedRow.methodology_version).toBe("1.0");
    expect(insertedRow.iprs).toBe(0); // TIER1_OPTIONS is the all-minimum fixture
    expect(insertedRow.final_level).toBe("Inicial");
    expect(insertedRow.answers).toEqual(answers);
    expect(insertedRow.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(insertedRow.created_at).toBe(new Date(insertedRow.created_at).toISOString());
    expect(insertedRow.interpretation_markdown).toContain("## 1. Resultado global");
    expect(insertedRow.interpretation_markdown).toContain("Acme");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: `Bearer ${VALID_ENV.RESEND_API_KEY}` }),
      }),
    );
    const emailBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(emailBody.to).toBe(VALID_ENV.SALES_NOTIFICATION_EMAIL);
    expect(emailBody.from).toBe(VALID_ENV.RESEND_FROM_EMAIL);
    expect(emailBody.subject).toContain("Acme");
    expect(emailBody.attachments[0].filename).toBe(`${insertedRow.id}-acme.md`);
  });

  it("still saves the submission (with a null interpretation) when building the markdown throws", async () => {
    buildInterpretationMarkdownMock.mockImplementationOnce(() => {
      throw new Error("boom — unexpected bug in the brief builder");
    });
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledTimes(1);

    const insertedRow = insertMock.mock.calls[0][0];
    expect(insertedRow.answers).toEqual(answers); // the lead's data is never lost
    expect(insertedRow.iprs).toBe(0);
    expect(insertedRow.interpretation_markdown).toBeNull();

    // Nothing to email when there's no markdown.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still returns 200 and saves the row when the Resend email send fails", async () => {
    fetchMock.mockResolvedValueOnce(new Response("server error", { status: 500 }));
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("still returns 200 and saves the row when Resend's fetch call throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(200);
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("skips the email gracefully when RESEND_API_KEY/SALES_NOTIFICATION_EMAIL are not configured", async () => {
    mockEnv.RESEND_API_KEY = undefined;
    mockEnv.SALES_NOTIFICATION_EMAIL = undefined;
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON with 400", async () => {
    const response = await POST(makeContext("{not json"));
    expect(response.status).toBe(400);
    expect((await readJson(response)).error).toBe("invalid_json");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a request missing lead or answers with 400", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    const missingLead = await POST(makeContext({ answers }));
    expect(missingLead.status).toBe(400);
    expect((await readJson(missingLead)).error).toBe("missing_fields");

    const missingAnswers = await POST(makeContext({ lead: VALID_LEAD }));
    expect(missingAnswers.status).toBe(400);
    expect((await readJson(missingAnswers)).error).toBe("missing_fields");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid lead fields (e.g. bad email) with 400", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: { ...VALID_LEAD, email: "not-an-email" }, answers }));

    expect(response.status).toBe(400);
    const body = await readJson(response);
    expect(body.error).toBe("invalid_lead");
    expect(body.fields.email).toBeTruthy();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects tampered/malformed answers with 422 — never trusts client-submitted data", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    const tampered = { ...answers, q1: [...answers.q1, answers.q1[0], answers.q1[0]] }; // 3 selections, exceeds max
    const response = await POST(makeContext({ lead: VALID_LEAD, answers: tampered }));

    expect(response.status).toBe(422);
    expect((await readJson(response)).error).toBe("invalid_answers");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid optionId instead of trusting it", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    const tampered = { ...answers, q4: { ...answers.q4, optionId: "q4_does_not_exist" } };
    const response = await POST(makeContext({ lead: VALID_LEAD, answers: tampered }));

    expect(response.status).toBe(422);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("returns 500 without leaking details when Supabase insert fails", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "connection refused", code: "500" } });
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(500);
    const body = await readJson(response);
    expect(body.error).toBe("storage_failed");
    expect(JSON.stringify(body)).not.toContain("connection refused");
  });

  it("returns 500 when Supabase env vars are not configured", async () => {
    mockEnv.SUPABASE_URL = undefined;
    mockEnv.SUPABASE_SECRET_KEY = undefined;
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(500);
    expect((await readJson(response)).error).toBe("storage_not_configured");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("never forwards a client-sent result — recomputes from answers only", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    const suspiciousResult = { iprs: 100, finalLevel: "Avanzada" };
    const response = await POST(
      makeContext({ lead: VALID_LEAD, answers, result: suspiciousResult }),
    );

    expect(response.status).toBe(200);
    const insertedRow = insertMock.mock.calls[0][0];
    expect(insertedRow.iprs).toBe(0);
    expect(insertedRow.final_level).toBe("Inicial");
  });

  it("rejects a request with 429 when the rate limiter denies it", async () => {
    rateLimiterMock.mockResolvedValueOnce({ success: false });
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(429);
    expect((await readJson(response)).error).toBe("rate_limited");
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("keys the rate limiter by the CF-Connecting-IP header", async () => {
    const answers = buildInput(TIER1_OPTIONS);
    await POST(makeContext({ lead: VALID_LEAD, answers }, { "CF-Connecting-IP": "203.0.113.5" }));

    expect(rateLimiterMock).toHaveBeenCalledWith({ key: "203.0.113.5" });
  });

  it("fails open (allows the request) when the rate limiter binding is missing", async () => {
    mockEnv.SUBMIT_DIAGNOSTIC_LIMITER = undefined;
    const answers = buildInput(TIER1_OPTIONS);
    const response = await POST(makeContext({ lead: VALID_LEAD, answers }));

    expect(response.status).toBe(200);
    expect(insertMock).toHaveBeenCalledTimes(1);
  });
});
