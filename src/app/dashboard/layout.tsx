import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createSupabaseServer();
  const { data } = await supabase!
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();
  return (
    <DashboardShell credits={data?.credits ?? 0}>{children}</DashboardShell>
  );
}
