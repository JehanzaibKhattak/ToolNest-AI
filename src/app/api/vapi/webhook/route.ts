import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVoiceConfig, type VoiceConfig } from "@/lib/voice/config";
import { pauseUserReceptionists } from "@/lib/voice/service";
import {
  TOOL_SUCCESS,
  messageAssistantId,
  normalizeEndOfCall,
  parseToolCall,
  verifyWebhookSecret,
  webhookSchema,
  type WebhookMessage,
} from "@/lib/voice/webhook";
export const runtime = "nodejs";
// Receives Vapi server messages. Payloads contain caller speech, so nothing
// from the request body is ever logged.
type Receptionist = { id: string; user_id: string };
export async function POST(req: Request) {
  let config: VoiceConfig;
  try {
    config = getVoiceConfig();
  } catch {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }
  const admin = getSupabaseAdmin();
  if (!admin)
    return Response.json({ error: "Not configured" }, { status: 503 });
  if (!verifyWebhookSecret(req.headers, config.webhookSecret))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = webhookSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  const message = parsed.data.message;
  const assistantId = messageAssistantId(message);
  const { data } = assistantId
    ? await admin
        .from("receptionists")
        .select("id,user_id")
        .eq("vapi_assistant_id", assistantId)
        .maybeSingle()
    : { data: null };
  const receptionist = data as Receptionist | null;
  if (message.type === "tool-calls")
    return handleToolCalls(admin, message, receptionist);
  if (!receptionist || !message.call?.id) return Response.json({ ok: true });
  if (message.type === "status-update")
    await handleStatus(admin, message, receptionist, message.call.id);
  if (message.type === "end-of-call-report")
    await handleEndOfCall(
      admin,
      config,
      message,
      receptionist,
      message.call.id,
    );
  return Response.json({ ok: true });
}
async function handleToolCalls(
  admin: SupabaseClient,
  message: WebhookMessage,
  receptionist: Receptionist | null,
) {
  const results = [];
  for (const call of message.toolCallList ?? []) {
    const parsed = parseToolCall(call);
    if (!parsed.ok) {
      results.push({ toolCallId: parsed.id, result: parsed.result });
      continue;
    }
    if (!receptionist) {
      results.push({
        toolCallId: parsed.id,
        result:
          "Saving is unavailable right now. Ask the caller to call back later.",
      });
      continue;
    }
    const { error } = await admin.from("receptionist_leads").insert({
      ...parsed.lead,
      user_id: receptionist.user_id,
      receptionist_id: receptionist.id,
      vapi_call_id: message.call?.id ?? null,
    });
    results.push({
      toolCallId: parsed.id,
      result: error
        ? "Saving failed. Apologise and ask the caller to call back later."
        : TOOL_SUCCESS[parsed.lead.kind],
    });
  }
  return Response.json({ results });
}
async function handleStatus(
  admin: SupabaseClient,
  message: WebhookMessage,
  receptionist: Receptionist,
  callId: string,
) {
  await admin.from("receptionist_calls").upsert(
    {
      vapi_call_id: callId,
      user_id: receptionist.user_id,
      receptionist_id: receptionist.id,
      caller_number:
        message.call?.customer?.number ?? message.customer?.number ?? null,
      status: message.status ?? "in-progress",
    },
    { onConflict: "vapi_call_id", ignoreDuplicates: true },
  );
  if (message.status)
    await admin
      .from("receptionist_calls")
      .update({ status: message.status, updated_at: new Date().toISOString() })
      .eq("vapi_call_id", callId)
      .neq("status", "ended");
}
async function handleEndOfCall(
  admin: SupabaseClient,
  config: VoiceConfig,
  message: WebhookMessage,
  receptionist: Receptionist,
  callId: string,
) {
  const call = normalizeEndOfCall(message);
  const { data, error } = await admin
    .from("receptionist_calls")
    .upsert(
      {
        vapi_call_id: callId,
        user_id: receptionist.user_id,
        receptionist_id: receptionist.id,
        caller_number: call.callerNumber,
        status: call.status,
        ended_reason: call.endedReason,
        started_at: call.startedAt,
        ended_at: call.endedAt,
        duration_seconds: call.durationSeconds,
        summary: call.summary,
        transcript: call.transcript,
        recording_url: call.recordingUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "vapi_call_id" },
    )
    .select("id")
    .single();
  if (error || !data || call.credits <= 0) return;
  const { data: remaining } = await admin.rpc("charge_call_credits", {
    p_call_id: (data as { id: string }).id,
    p_credits: call.credits,
  });
  if (remaining === 0)
    await pauseUserReceptionists(admin, config.apiKey, receptionist.user_id);
}
