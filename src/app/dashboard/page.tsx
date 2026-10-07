import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { tools } from "@/lib/tools";
export default async function Dashboard() {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const [{ data: profile }, { count }, { data: recent }] = await Promise.all([
    supabase!
      .from("profiles")
      .select("full_name,credits,plan")
      .eq("id", user!.id)
      .single(),
    supabase!.from("generations").select("*", { count: "exact", head: true }),
    supabase!
      .from("generations")
      .select("id,tool_name,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  return (
    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="mt-2 text-3xl font-black">
        Welcome
        {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
      </h1>
      <div className="grid-auto mt-7">
        {[
          ["Available credits", profile?.credits ?? 0],
          ["Total generations", count ?? 0],
          ["Account plan", profile?.plan ?? "Free"],
          [
            "Most-used tool",
            recent?.[0]?.tool_name?.replaceAll("-", " ") ?? "None yet",
          ],
        ].map(([label, value]) => (
          <div className="card p-5" key={label}>
            <p className="muted text-sm">{label}</p>
            <p className="mt-2 text-2xl font-black capitalize">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-bold">Quick access</h2>
      <div className="grid-auto mt-4">
        {tools.map(({ slug, name, description, icon: Icon }) => (
          <Link
            className="card p-5 transition hover:-translate-y-1"
            href={`/tools/${slug}`}
            key={slug}
          >
            <Icon className="text-amber-400" />
            <h3 className="mt-4 font-bold">{name}</h3>
            <p className="muted mt-1 text-sm">{description}</p>
          </Link>
        ))}
        <Link
          className="card p-5 transition hover:-translate-y-1"
          href="/dashboard/receptionists"
        >
          <PhoneCall className="text-amber-400" />
          <h3 className="mt-4 font-bold">AI Receptionist</h3>
          <p className="muted mt-1 text-sm">
            A phone number that answers calls, books requests and captures leads
            24/7.
          </p>
        </Link>
      </div>
      <h2 className="mt-10 text-xl font-bold">Recent activity</h2>
      <div className="card mt-4 divide-y">
        {recent?.length ? (
          recent.map((item) => (
            <div className="flex justify-between p-4" key={item.id}>
              <span className="capitalize">
                {item.tool_name.replaceAll("-", " ")}
              </span>
              <time className="muted text-sm">
                {new Date(item.created_at).toLocaleDateString()}
              </time>
            </div>
          ))
        ) : (
          <p className="muted p-6">
            Your successful generations will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
