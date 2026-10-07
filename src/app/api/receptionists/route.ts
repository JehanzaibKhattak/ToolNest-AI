import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  receptionistCreateSchema,
  settingsToRow,
} from "@/lib/validations/receptionist";
import {
  MAX_RECEPTIONISTS_PER_USER,
  RECEPTIONIST_SETUP_CREDITS,
  getVoiceConfig,
} from "@/lib/voice/config";
import { buildAssistantPayload } from "@/lib/voice/prompt";
import {
  createAssistant,
  createPhoneNumber,
  deleteAssistant,
  deletePhoneNumber,
} from "@/lib/voice/vapi";
import { voiceErrorMessage } from "@/lib/voice/service";
export const runtime = "nodejs";
const TOOL_NAME = "ai-receptionist-setup";
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Please sign in." }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = receptionistCreateSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      {
        error: "Check the highlighted fields.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  let config;
  try {
    config = getVoiceConfig();
  } catch (error) {
    return Response.json({ error: voiceErrorMessage(error) }, { status: 503 });
  }
  const supabase = await createSupabaseServer();
  const admin = getSupabaseAdmin();
  if (!supabase || !admin)
    return Response.json(
      { error: "Service is not configured." },
      { status: 503 },
    );
  const limit = consumeRateLimit(`receptionist:${user.id}`, 5, 60 * 60 * 1000);
  if (!limit.allowed)
    return Response.json(
      { error: "Too many setup attempts. Try again later." },
      {
        status: 429,
        headers: { "retry-after": String(limit.retryAfterSeconds) },
      },
    );
  const { count } = await supabase
    .from("receptionists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_RECEPTIONISTS_PER_USER)
    return Response.json(
      {
        error: `You can run up to ${MAX_RECEPTIONISTS_PER_USER} receptionists. Delete one to add another.`,
      },
      { status: 409 },
    );
  const { data: reserved, error: reserveError } = await supabase.rpc(
    "reserve_credits",
    { p_tool_name: TOOL_NAME, p_credits: RECEPTIONIST_SETUP_CREDITS },
  );
  if (reserveError || !reserved)
    return Response.json(
      { error: "You do not have enough credits." },
      { status: 402 },
    );
  const { areaCode, ...settings } = parsed.data;
  let receptionistId: string | undefined;
  let assistantId: string | undefined;
  let phoneNumberId: string | undefined;
  try {
    const { data: row, error } = await supabase
      .from("receptionists")
      .insert({
        user_id: user.id,
        area_code: areaCode,
        ...settingsToRow(settings),
      })
      .select("id")
      .single();
    if (error || !row) throw new Error("SAVE_FAILED");
    receptionistId = (row as { id: string }).id;
    assistantId = (
      await createAssistant(
        config.apiKey,
        buildAssistantPayload(settings, config, receptionistId),
      )
    ).id;
    await admin
      .from("receptionists")
      .update({ vapi_assistant_id: assistantId })
      .eq("id", receptionistId)
      .throwOnError();
    const phone = await createPhoneNumber(config.apiKey, {
      assistantId,
      name: settings.name,
      areaCode,
    });
    phoneNumberId = phone.id;
    await admin
      .from("receptionists")
      .update({
        vapi_phone_number_id: phone.id,
        phone_number: phone.number ?? null,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", receptionistId)
      .throwOnError();
    await supabase.from("usage_events").insert({
      user_id: user.id,
      tool_name: TOOL_NAME,
      credits_used: RECEPTIONIST_SETUP_CREDITS,
      status: "success",
    });
    return Response.json({ data: { id: receptionistId } }, { status: 201 });
  } catch (error) {
    await Promise.allSettled([
      phoneNumberId
        ? deletePhoneNumber(config.apiKey, phoneNumberId)
        : Promise.resolve(),
      assistantId
        ? deleteAssistant(config.apiKey, assistantId)
        : Promise.resolve(),
    ]);
    if (receptionistId)
      await admin.from("receptionists").delete().eq("id", receptionistId);
    await supabase.rpc("refund_credits", {
      p_tool_name: TOOL_NAME,
      p_credits: RECEPTIONIST_SETUP_CREDITS,
    });
    const message =
      error instanceof Error && error.message === "VAPI_400"
        ? "The phone provider rejected the setup. Try a different area code or leave it blank. Your credits were restored."
        : `${voiceErrorMessage(error)} Your credits were restored.`;
    return Response.json({ error: message }, { status: 503 });
  }
}
