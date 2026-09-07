import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildInput, TIER1_OPTIONS } from "../../lib/diagnostic/test-fixtures";
import type { LeadFormValues } from "../../lib/diagnostic-submission";

type InsertError = { message: string; code?: string } | null;

const VALID_ENV = { SUPABASE_URL: "https://test.supabase.co", SUPABASE_SECRET_KEY: "test-service-role-key" };

const { insertMock, fromMock, createClientMock, mockEnv } = vi.hoisted(() => {
  const insertMock = vi.fn(async (_row: Record<string, unknown>): Promise<{ error: InsertError }> => ({
    error: null,
  }));
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  const createClientMock = vi.fn(() => ({ from: fromMock }));
  const mockEnv: Record<string, string | undefined> = {};
  return { insertMock, fromMock, createClientMock, mockEnv };
});

vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));
// Astro's `locals.runtime.env` was removed in favor of this Cloudflare
// Workers runtime module — mock it the same way the real route reads it.
vi.mock("cloudflare:workers", () => ({ env: mockEnv }));

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

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/submit-diagnostic", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeContext(body: unknown) {
  return { request: makeRequest(body) } as never;
}

async function readJson(response: Response): Promise<any> {
  return response.json();
}

describe("POST /api/submit-diagnostic", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
    createClientMock.mockClear();
    insertMock.mockResolvedValue({ error: null });
    mockEnv.SUPABASE_URL = VALID_ENV.SUPABASE_URL;
    mockEnv.SUPABASE_SECRET_KEY = VALID_ENV.SUPABASE_SECRET_KEY;
  });

  afterEach(() => {
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
});
