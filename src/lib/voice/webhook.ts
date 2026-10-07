import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { callCredits } from "./config";
import {
  CAPTURE_LEAD_TOOL,
  REQUEST_APPOINTMENT_TOOL,
  captureLeadArgsSchema,
  requestAppointmentArgsSchema,
} from "./prompt";

const digest = (value: string) => createHash("sha256").update(value).digest();
export function verifyWebhookSecret(headers: Headers, secret: string) {
  const bearer = headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const provided = headers.get("x-vapi-secret") ?? bearer;
  if (!provided) return false;
  return timingSafeEqual(digest(provided), digest(secret));
}

const optionalString = z.string().nullish();
const callSchema = z
  .object({
    id: z.string().min(1),
    assistantId: optionalString,
    customer: z.object({ number: optionalString }).nullish(),
    startedAt: optionalString,
    endedAt: optionalString,
  })
  .loose();
const toolCallSchema = z
  .object({
    id: z.string().min(1),
    function: z
      .object({ name: z.string(), arguments: z.unknown().optional() })
      .loose()
      .nullish(),
    name: optionalString,
    arguments: z.unknown().optional(),
    parameters: z.unknown().optional(),
  })
  .loose();
export const webhookSchema = z.object({
  message: z
    .object({
      type: z.string(),
      status: optionalString,
      call: callSchema.nullish(),
      assistant: z.object({ id: optionalString }).loose().nullish(),
      customer: z.object({ number: optionalString }).nullish(),
      toolCallList: z.array(toolCallSchema).nullish(),
      endedReason: optionalString,
      startedAt: optionalString,
      endedAt: optionalString,
      durationSeconds: z.number().nullish(),
      summary: optionalString,
      transcript: optionalString,
      recordingUrl: optionalString,
      analysis: z.object({ summary: optionalString }).loose().nullish(),
      artifact: z
        .object({
          transcript: optionalString,
          recordingUrl: optionalString,
          recording: z
            .object({
              mono: z.object({ combinedUrl: optionalString }).loose().nullish(),
            })
            .loose()
            .nullish(),
        })
        .loose()
        .nullish(),
    })
    .loose(),
});
export type WebhookMessage = z.infer<typeof webhookSchema>["message"];

export function messageAssistantId(m: WebhookMessage) {
  return m.call?.assistantId ?? m.assistant?.id ?? null;
}
const MAX_TRANSCRIPT = 100_000;
const MAX_SUMMARY = 5_000;
const toIso = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
const httpsUrl = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
};
export function normalizeEndOfCall(m: WebhookMessage) {
  const startedAt = toIso(m.startedAt ?? m.call?.startedAt);
  const endedAt = toIso(m.endedAt ?? m.call?.endedAt);
  const measured =
    startedAt && endedAt
      ? (Date.parse(endedAt) - Date.parse(startedAt)) / 1000
      : 0;
  const duration = Math.max(0, Math.round(m.durationSeconds ?? measured));
  return {
    callerNumber: m.call?.customer?.number ?? m.customer?.number ?? null,
    status: "ended",
    endedReason: m.endedReason?.slice(0, 200) ?? null,
    startedAt,
    endedAt,
    durationSeconds: duration,
    summary: (m.analysis?.summary ?? m.summary)?.slice(0, MAX_SUMMARY) ?? null,
    transcript:
      (m.artifact?.transcript ?? m.transcript)?.slice(0, MAX_TRANSCRIPT) ??
      null,
    recordingUrl: httpsUrl(
      m.artifact?.recordingUrl ??
        m.artifact?.recording?.mono?.combinedUrl ??
        m.recordingUrl,
    ),
    credits: callCredits(duration),
  };
}

function toolArguments(call: z.infer<typeof toolCallSchema>) {
  const raw = call.function?.arguments ?? call.arguments ?? call.parameters;
  if (typeof raw !== "string") return raw ?? {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return {};
  }
}
export type LeadInsert = {
  kind: "lead" | "appointment";
  caller_name: string;
  callback_number: string;
  email: string;
  reason: string;
  service: string;
  preferred_time: string;
  urgency: "low" | "normal" | "high";
  notes: string;
};
export type ParsedToolCall =
  | { id: string; ok: true; lead: LeadInsert }
  | { id: string; ok: false; result: string };
export function parseToolCall(
  call: z.infer<typeof toolCallSchema>,
): ParsedToolCall {
  const name = call.function?.name ?? call.name;
  const args = toolArguments(call);
  if (name === CAPTURE_LEAD_TOOL) {
    const parsed = captureLeadArgsSchema.safeParse(args);
    if (!parsed.success)
      return {
        id: call.id,
        ok: false,
        result:
          "Missing details. Ask for the caller's name, callback number and reason, then try again.",
      };
    const a = parsed.data;
    return {
      id: call.id,
      ok: true,
      lead: {
        kind: "lead",
        caller_name: a.callerName,
        callback_number: a.callbackNumber,
        email: a.email,
        reason: a.reason,
        service: "",
        preferred_time: "",
        urgency: a.urgency,
        notes: "",
      },
    };
  }
  if (name === REQUEST_APPOINTMENT_TOOL) {
    const parsed = requestAppointmentArgsSchema.safeParse(args);
    if (!parsed.success)
      return {
        id: call.id,
        ok: false,
        result:
          "Missing details. Ask for the caller's name, callback number, service and preferred time, then try again.",
      };
    const a = parsed.data;
    return {
      id: call.id,
      ok: true,
      lead: {
        kind: "appointment",
        caller_name: a.callerName,
        callback_number: a.callbackNumber,
        email: "",
        reason: "",
        service: a.service,
        preferred_time: a.preferredTime,
        urgency: "normal",
        notes: a.notes,
      },
    };
  }
  return { id: call.id, ok: false, result: "That action is not available." };
}
export const TOOL_SUCCESS = {
  lead: "Saved. Tell the caller the team will call them back soon.",
  appointment:
    "Request saved. Tell the caller the team will call to confirm the appointment.",
} as const;
