import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
export default async function Account() {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const { data } = await supabase!
    .from("profiles")
    .select("full_name,email,plan,credits,created_at")
    .eq("id", user!.id)
    .single();
  return (
    <>
      <p className="eyebrow">Settings</p>
      <h1 className="mt-2 text-3xl font-black">Account</h1>
      <div className="card mt-7 grid gap-5 p-6">
        <div>
          <p className="muted text-sm">Name</p>
          <p className="font-bold">{data?.full_name || "Not provided"}</p>
        </div>
        <div>
          <p className="muted text-sm">Email</p>
          <p className="font-bold">{data?.email || user?.email}</p>
        </div>
        <div>
          <p className="muted text-sm">Plan & credits</p>
          <p className="font-bold capitalize">
            {data?.plan || "free"} · {data?.credits ?? 0} credits
          </p>
        </div>
      </div>
      <p className="muted mt-5 text-sm">
        Password changes use the secure “forgot password” email flow.
      </p>
    </>
  );
}
