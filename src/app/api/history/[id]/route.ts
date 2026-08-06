import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { error } = await supabase!
    .from("generations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  return error
    ? Response.json({ error: "Delete failed" }, { status: 500 })
    : Response.json({ ok: true });
}
