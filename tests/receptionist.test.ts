import { describe, expect, it } from "vitest";
import {
  receptionistCreateSchema,
  receptionistUpdateSchema,
} from "@/lib/validations/receptionist";
import { callCredits } from "@/lib/voice/config";
import { formatDuration, formatPhone } from "@/lib/voice/format";
import {
  buildAssistantPayload,
  buildReceptionistPrompt,
} from "@/lib/voice/prompt";
import {
  normalizeEndOfCall,
  parseToolCall,
  verifyWebhookSecret,
  webhookSchema,
} from "@/lib/voice/webhook";
const settings = {
  name: "Front desk",
  businessName: "Bright Smiles Dental",
  industry: "dental clinic",
  greeting: "Thanks for calling Bright Smiles, how can I help?",
  services: "Cleanings from $99 and whitening from $250.",
  businessHours: "Mon-Fri 8am-6pm",
  faqs: "",
  bookingInstructions: "",
  transferNumber: "",
  voiceId: "Elliot" as const,
  recordingEnabled: true,
};
const config = {
  model: "operator-model",
  webhookUrl: "https://example.com/api/vapi/webhook",
  webhookSecret: "s".repeat(32),
};
const message = (m: Record<string, unknown>) =>
  webhookSchema.parse({ message: m }).message;
describe("receptionist validation", () => {
  it("accepts valid settings with defaults", () => {
    const parsed = receptionistCreateSchema.parse({
      ...settings,
      faqs: undefined,
    });
    expect(parsed.faqs).toBe("");
    expect(parsed.areaCode).toBe("");
  });
  it("rejects non E.164 transfer numbers", () =>
    expect(
      receptionistUpdateSchema.safeParse({
        ...settings,
        transferNumber: "555-1234",
      }).success,
    ).toBe(false));
  it("rejects unknown voices and long names", () => {
    expect(
      receptionistUpdateSchema.safeParse({ ...settings, voiceId: "Nope" })
        .success,
    ).toBe(false);
    expect(
      receptionistUpdateSchema.safeParse({ ...settings, name: "x".repeat(41) })
        .success,
    ).toBe(false);
  });
});
describe("receptionist prompt", () => {
  it("includes business data and omits empty sections", () => {
    const prompt = buildReceptionistPrompt(settings);
    expect(prompt).toContain("Bright Smiles Dental");
    expect(prompt).toContain("<services_and_pricing>");
    expect(prompt).not.toContain("<frequently_asked_questions>");
    expect(prompt).not.toMatch(/\n\n\n/);
  });
  it("adds a transfer tool only when a number is configured", () => {
    const without = buildAssistantPayload(settings, config, "r1");
    const withTransfer = buildAssistantPayload(
      { ...settings, transferNumber: "+14155550123" },
      config,
      "r1",
    );
    expect(without.model.tools).toHaveLength(2);
    expect(withTransfer.model.tools).toHaveLength(3);
    expect(withTransfer.server.headers["x-vapi-secret"]).toBe(
      config.webhookSecret,
    );
    expect(without.metadata.receptionistId).toBe("r1");
  });
});
describe("receptionist webhook", () => {
  it("verifies the shared secret from either header", () => {
    const secret = config.webhookSecret;
    expect(
      verifyWebhookSecret(new Headers({ "x-vapi-secret": secret }), secret),
    ).toBe(true);
    expect(
      verifyWebhookSecret(
        new Headers({ authorization: `Bearer ${secret}` }),
        secret,
      ),
    ).toBe(true);
    expect(
      verifyWebhookSecret(new Headers({ "x-vapi-secret": "wrong" }), secret),
    ).toBe(false);
    expect(verifyWebhookSecret(new Headers(), secret)).toBe(false);
  });
  it("normalizes an end-of-call report and computes credits", () => {
    const call = normalizeEndOfCall(
      message({
        type: "end-of-call-report",
        call: { id: "c1", assistantId: "a1", customer: { number: "+1555" } },
        startedAt: "2026-10-07T10:00:00.000Z",
        endedAt: "2026-10-07T10:02:05.000Z",
        endedReason: "customer-ended-call",
        analysis: { summary: "Booked a cleaning." },
        artifact: {
          transcript: "AI: Hello",
          recordingUrl: "https://storage.example.com/r.wav",
        },
      }),
    );
    expect(call.durationSeconds).toBe(125);
    expect(call.credits).toBe(3);
    expect(call.summary).toBe("Booked a cleaning.");
    expect(call.callerNumber).toBe("+1555");
    expect(call.recordingUrl).toBe("https://storage.example.com/r.wav");
  });
  it("drops non-https recording urls", () =>
    expect(
      normalizeEndOfCall(
        message({
          type: "end-of-call-report",
          recordingUrl: "javascript:alert(1)",
        }),
      ).recordingUrl,
    ).toBeNull());
  it("parses tool calls with string or object arguments", () => {
    const lead = parseToolCall({
      id: "t1",
      function: {
        name: "capture_lead",
        arguments: JSON.stringify({
          callerName: "Sam",
          callbackNumber: "+14155550123",
          reason: "Quote",
          urgency: "extreme",
        }),
      },
    });
    expect(lead.ok && lead.lead.urgency).toBe("normal");
    const appointment = parseToolCall({
      id: "t2",
      function: {
        name: "request_appointment",
        arguments: {
          callerName: "Sam",
          callbackNumber: "+14155550123",
          service: "Cleaning",
          preferredTime: "Tuesday morning",
        },
      },
    });
    expect(appointment.ok && appointment.lead.kind).toBe("appointment");
    expect(
      parseToolCall({
        id: "t3",
        function: { name: "capture_lead", arguments: {} },
      }).ok,
    ).toBe(false);
    expect(
      parseToolCall({ id: "t4", function: { name: "drop_db", arguments: {} } })
        .ok,
    ).toBe(false);
  });
});
describe("voice helpers", () => {
  it("bills per started minute", () => {
    expect(callCredits(0)).toBe(0);
    expect(callCredits(1)).toBe(1);
    expect(callCredits(60)).toBe(1);
    expect(callCredits(61)).toBe(2);
    expect(callCredits(Number.NaN)).toBe(0);
  });
  it("formats phone numbers and durations", () => {
    expect(formatPhone("+14155550123")).toBe("+1 (415) 555-0123");
    expect(formatPhone("+442071234567")).toBe("+442071234567");
    expect(formatPhone(null)).toBe("Number pending");
    expect(formatDuration(125)).toBe("2m 05s");
    expect(formatDuration(42)).toBe("42s");
  });
});
