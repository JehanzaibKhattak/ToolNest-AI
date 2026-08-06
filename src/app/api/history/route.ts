import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase!
    .from("generations")
    .select("id,tool_name,output,metadata,credits_used,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return error
    ? Response.json({ error: "Could not load history" }, { status: 500 })
    : Response.json({ data });
}
