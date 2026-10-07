import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { receptionistStatusSchema } from "@/lib/validations/receptionist";
import { getVoiceConfig } from "@/lib/voice/config";
import { setPhoneNumberAssistant } from "@/lib/voice/vapi";
import { voiceErrorMessage } from "@/lib/voice/service";
export const runtime = "nodejs";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const admin = getSupabaseAdmin();
  if (!user || !supabase)
    return Response.json({ error: "Please sign in." }, { status: 401 });
  if (!admin)
    return Response.json(
      { error: "Service is not configured." },
      { status: 503 },
    );
  const parsed = receptionistStatusSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json({ error: "Invalid request." }, { status: 422 });
  const [{ data: row }, { data: profile }] = await Promise.all([
    supabase
      .from("receptionists")
      .select("id,status,vapi_assistant_id,vapi_phone_number_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("credits").eq("id", user.id).single(),
  ]);
  const r = row as {
    status: string;
    vapi_assistant_id: string | null;
    vapi_phone_number_id: string | null;
  } | null;
  if (!r || !r.vapi_assistant_id || !r.vapi_phone_number_id)
    return Response.json({ error: "Receptionist not found." }, { status: 404 });
  const { active } = parsed.data;
  if (active && ((profile as { credits: number } | null)?.credits ?? 0) <= 0)
    return Response.json(
      { error: "Add credits before taking calls again." },
      { status: 402 },
    );
  try {
    const { apiKey } = getVoiceConfig();
    await setPhoneNumberAssistant(
      apiKey,
      r.vapi_phone_number_id,
      active ? r.vapi_assistant_id : null,
    );
  } catch (error) {
    return Response.json({ error: voiceErrorMessage(error) }, { status: 503 });
  }
  await admin
    .from("receptionists")
    .update({
      status: active ? "active" : "paused",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  return Response.json({ ok: true, status: active ? "active" : "paused" });
}
