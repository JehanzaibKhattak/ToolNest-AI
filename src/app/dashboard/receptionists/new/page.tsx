import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  MAX_RECEPTIONISTS_PER_USER,
  RECEPTIONIST_SETUP_CREDITS,
} from "@/lib/voice/config";
import { ReceptionistForm } from "@/components/receptionist-form";
export default async function NewReceptionist() {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const [{ count }, { data: profile }] = await Promise.all([
    supabase!
      .from("receptionists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase!.from("profiles").select("credits").eq("id", user!.id).single(),
  ]);
  if ((count ?? 0) >= MAX_RECEPTIONISTS_PER_USER)
    redirect("/dashboard/receptionists");
  const credits = (profile as { credits: number } | null)?.credits ?? 0;
  return (
    <>
      <Link className="muted text-sm" href="/dashboard/receptionists">
        ← All receptionists
      </Link>
      <p className="eyebrow mt-4">New receptionist</p>
      <h1 className="mt-2 mb-2 text-3xl font-black">Set up your phone agent</h1>
      <p className="muted mb-7 max-w-2xl">
        Tell the receptionist about the business. It only answers from what you
        write here, so include prices, hours and policies callers ask about.
      </p>
      {credits < RECEPTIONIST_SETUP_CREDITS ? (
        <div className="card p-6" role="alert">
          You need {RECEPTIONIST_SETUP_CREDITS} credits to create a receptionist
          and have {credits}.
        </div>
      ) : (
        <ReceptionistForm
          mode="create"
          setupCredits={RECEPTIONIST_SETUP_CREDITS}
        />
      )}
    </>
  );
}
