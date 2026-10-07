import type { SupabaseClient } from "@supabase/supabase-js";
import { setPhoneNumberAssistant } from "./vapi";
// Detaches every active receptionist of a user from its phone number so new
// calls stop once credits are exhausted. Best effort per receptionist.
export async function pauseUserReceptionists(
  admin: SupabaseClient,
  apiKey: string,
  userId: string,
) {
  const { data } = await admin
    .from("receptionists")
    .select("id,vapi_phone_number_id")
    .eq("user_id", userId)
    .eq("status", "active");
  for (const row of (data ?? []) as {
    id: string;
    vapi_phone_number_id: string | null;
  }[]) {
    try {
      if (row.vapi_phone_number_id)
        await setPhoneNumberAssistant(apiKey, row.vapi_phone_number_id, null);
      await admin
        .from("receptionists")
        .update({ status: "paused", updated_at: new Date().toISOString() })
        .eq("id", row.id);
    } catch {
      // Leave the receptionist active; the next charge retries the pause.
    }
  }
}
export function voiceErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "VOICE_NOT_CONFIGURED")
    return "Voice service is not configured.";
  return "The phone provider could not complete the request. Please try again.";
}
