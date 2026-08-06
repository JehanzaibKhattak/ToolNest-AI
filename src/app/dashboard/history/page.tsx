import { createSupabaseServer } from "@/lib/supabase/server";
import { HistoryList } from "@/components/history-list";
export default async function History() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase!
    .from("generations")
    .select("id,tool_name,output,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return (
    <>
      <p className="eyebrow">Library</p>
      <h1 className="mt-2 mb-7 text-3xl font-black">Generation history</h1>
      <HistoryList initial={data ?? []} />
    </>
  );
}
