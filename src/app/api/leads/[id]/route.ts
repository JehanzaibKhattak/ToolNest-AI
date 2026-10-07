import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { leadStatusSchema } from "@/lib/validations/receptionist";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  if (!user || !supabase)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = leadStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Invalid status." }, { status: 422 });
  const { id } = await params;
  const { error } = await supabase
    .from("receptionist_leads")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  return error
    ? Response.json({ error: "Update failed" }, { status: 500 })
    : Response.json({ ok: true });
}
