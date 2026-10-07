import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  RECEPTIONIST_COLUMNS,
  receptionistRowSchema,
  receptionistUpdateSchema,
  settingsToRow,
} from "@/lib/validations/receptionist";
import { getVoiceConfig } from "@/lib/voice/config";
import { buildAssistantPayload } from "@/lib/voice/prompt";
import {
  deleteAssistant,
  deletePhoneNumber,
  updateAssistant,
} from "@/lib/voice/vapi";
import { voiceErrorMessage } from "@/lib/voice/service";
export const runtime = "nodejs";
async function loadOwned(id: string) {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  if (!user || !supabase) return null;
  const { data } = await supabase
    .from("receptionists")
    .select(RECEPTIONIST_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  const row = receptionistRowSchema.safeParse(data);
  return row.success ? { user, supabase, row: row.data } : null;
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await loadOwned(id);
  if (!owned)
    return Response.json({ error: "Receptionist not found." }, { status: 404 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = receptionistUpdateSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      {
        error: "Check the highlighted fields.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  try {
    const config = getVoiceConfig();
    if (owned.row.vapi_assistant_id)
      await updateAssistant(
        config.apiKey,
        owned.row.vapi_assistant_id,
        buildAssistantPayload(parsed.data, config, id),
      );
  } catch (error) {
    return Response.json({ error: voiceErrorMessage(error) }, { status: 503 });
  }
  const { error } = await owned.supabase
    .from("receptionists")
    .update({
      ...settingsToRow(parsed.data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", owned.user.id);
  if (error)
    return Response.json(
      {
        error:
          "Your phone agent was updated but the settings could not be saved. Save again.",
      },
      { status: 500 },
    );
  return Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owned = await loadOwned(id);
  if (!owned)
    return Response.json({ error: "Receptionist not found." }, { status: 404 });
  try {
    if (owned.row.vapi_phone_number_id || owned.row.vapi_assistant_id) {
      const { apiKey } = getVoiceConfig();
      if (owned.row.vapi_phone_number_id)
        await deletePhoneNumber(apiKey, owned.row.vapi_phone_number_id);
      if (owned.row.vapi_assistant_id)
        await deleteAssistant(apiKey, owned.row.vapi_assistant_id);
    }
  } catch (error) {
    return Response.json({ error: voiceErrorMessage(error) }, { status: 503 });
  }
  const { error } = await owned.supabase
    .from("receptionists")
    .delete()
    .eq("id", id)
    .eq("user_id", owned.user.id);
  return error
    ? Response.json({ error: "Delete failed." }, { status: 500 })
    : Response.json({ ok: true });
}
