import Link from "next/link";
import { PhoneCall, Plus } from "lucide-react";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPhone } from "@/lib/voice/format";
import {
  CALL_CREDITS_PER_MINUTE,
  MAX_RECEPTIONISTS_PER_USER,
  RECEPTIONIST_SETUP_CREDITS,
} from "@/lib/voice/config";
import { ReceptionistStatus } from "@/components/receptionist-status";
type Row = {
  id: string;
  name: string;
  business_name: string;
  status: "provisioning" | "active" | "paused" | "failed";
  phone_number: string | null;
  receptionist_calls: { count: number }[];
  receptionist_leads: { count: number }[];
};
export default async function Receptionists() {
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const { data } = await supabase!
    .from("receptionists")
    .select(
      "id,name,business_name,status,phone_number,receptionist_calls(count),receptionist_leads(count)",
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  const canAdd = rows.length < MAX_RECEPTIONISTS_PER_USER;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Voice</p>
          <h1 className="mt-2 text-3xl font-black">AI Receptionists</h1>
          <p className="muted mt-2 max-w-2xl">
            A phone number answered 24/7 by an AI receptionist that knows your
            business, answers questions, books appointment requests and captures
            leads. Setup costs {RECEPTIONIST_SETUP_CREDITS} credits; calls use{" "}
            {CALL_CREDITS_PER_MINUTE} credit per started minute.
          </p>
        </div>
        {canAdd && rows.length > 0 && (
          <Link className="btn btn-primary" href="/dashboard/receptionists/new">
            <Plus size={18} />
            New receptionist
          </Link>
        )}
      </div>
      {rows.length ? (
        <div className="grid-auto mt-7">
          {rows.map((r) => (
            <Link
              className="card grid gap-3 p-5 transition hover:-translate-y-1"
              href={`/dashboard/receptionists/${r.id}`}
              key={r.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{r.name}</h2>
                  <p className="muted text-sm">{r.business_name}</p>
                </div>
                <ReceptionistStatus status={r.status} />
              </div>
              <p className="text-xl font-black">
                {formatPhone(r.phone_number)}
              </p>
              <p className="muted text-sm">
                {r.receptionist_calls[0]?.count ?? 0} calls ·{" "}
                {r.receptionist_leads[0]?.count ?? 0} leads
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card mt-7 grid justify-items-center gap-3 p-10 text-center">
          <PhoneCall className="text-amber-400" size={32} />
          <h2 className="text-xl font-bold">No receptionists yet</h2>
          <p className="muted max-w-md">
            Create one in a couple of minutes. You will get a phone number you
            can call right away or forward your business line to.
          </p>
          <Link className="btn btn-primary" href="/dashboard/receptionists/new">
            <Plus size={18} />
            Create your first receptionist
          </Link>
        </div>
      )}
    </>
  );
}
