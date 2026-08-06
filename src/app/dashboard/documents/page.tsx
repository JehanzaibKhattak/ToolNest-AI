import { createSupabaseServer } from "@/lib/supabase/server";
export default async function Documents() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase!
    .from("documents")
    .select("id,file_name,file_type,file_size,created_at")
    .order("created_at", { ascending: false });
  return (
    <>
      <p className="eyebrow">Files</p>
      <h1 className="mt-2 text-3xl font-black">Documents</h1>
      <p className="muted mt-2">
        Resume documents you choose to save will appear here.
      </p>
      <div className="card mt-7">
        {data?.length ? (
          data.map((x) => (
            <div
              className="flex justify-between border-b p-4 last:border-0"
              key={x.id}
            >
              <span>{x.file_name}</span>
              <span className="muted text-sm">
                {Math.ceil(x.file_size / 1024)} KB
              </span>
            </div>
          ))
        ) : (
          <p className="muted p-8 text-center">No saved documents.</p>
        )}
      </div>
    </>
  );
}
