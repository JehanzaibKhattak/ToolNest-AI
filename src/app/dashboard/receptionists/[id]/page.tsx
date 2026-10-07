import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, PhoneIncoming, UserPlus } from "lucide-react";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  RECEPTIONIST_COLUMNS,
  receptionistRowSchema,
} from "@/lib/validations/receptionist";
import { getVoiceConfig } from "@/lib/voice/config";
import { formatDuration, formatPhone } from "@/lib/voice/format";
import { getPhoneNumber } from "@/lib/voice/vapi";
import { ReceptionistControls } from "@/components/receptionist-controls";
import { ReceptionistStatus } from "@/components/receptionist-status";
import { LeadStatus } from "@/components/lead-status";
type Call = {
  id: string;
  caller_number: string | null;
  status: string;
  ended_reason: string | null;
  started_at: string | null;
  created_at: string;
  duration_seconds: number;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  credits_used: number;
};
type Lead = {
  id: string;
  kind: "lead" | "appointment";
  caller_name: string;
  callback_number: string;
  email: string;
  reason: string;
  service: string;
  preferred_time: string;
  urgency: "low" | "normal" | "high";
  notes: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
};
// Vapi can assign a number shortly after it is created; fill it in lazily.
async function resolvePhoneNumber(id: string, phoneNumberId: string) {
  try {
    const admin = getSupabaseAdmin();
    const phone = await getPhoneNumber(getVoiceConfig().apiKey, phoneNumberId);
    if (admin && phone.number)
      await admin
        .from("receptionists")
        .update({ phone_number: phone.number })
        .eq("id", id);
    return phone.number ?? null;
  } catch {
    return null;
  }
}
export default async function ReceptionistDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createSupabaseServer();
  const { data } = await supabase!
    .from("receptionists")
    .select(RECEPTIONIST_COLUMNS)
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();
  const parsed = receptionistRowSchema.safeParse(data);
  if (!parsed.success) notFound();
  const r = parsed.data;
  const [{ data: callData }, { data: leadData }, phoneNumber] =
    await Promise.all([
      supabase!
        .from("receptionist_calls")
        .select(
          "id,caller_number,status,ended_reason,started_at,created_at,duration_seconds,summary,transcript,recording_url,credits_used",
        )
        .eq("receptionist_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase!
        .from("receptionist_leads")
        .select(
          "id,kind,caller_name,callback_number,email,reason,service,preferred_time,urgency,notes,status,created_at",
        )
        .eq("receptionist_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      r.phone_number || !r.vapi_phone_number_id
        ? Promise.resolve(r.phone_number)
        : resolvePhoneNumber(id, r.vapi_phone_number_id),
    ]);
  const calls = (callData ?? []) as Call[];
  const leads = (leadData ?? []) as Lead[];
  const minutes = Math.round(
    calls.reduce((sum, c) => sum + c.duration_seconds, 0) / 60,
  );
  const openLeads = leads.filter((l) => l.status === "new").length;
  return (
    <>
      <Link className="muted text-sm" href="/dashboard/receptionists">
        ← All receptionists
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black">{r.name}</h1>
            <ReceptionistStatus status={r.status} />
          </div>
          <p className="muted mt-1">{r.business_name}</p>
        </div>
        <ReceptionistControls id={r.id} status={r.status} />
      </div>
      <div className="card mt-7 grid gap-2 p-6">
        <p className="muted text-sm">Phone number</p>
        {phoneNumber ? (
          <a className="text-3xl font-black" href={`tel:${phoneNumber}`}>
            {formatPhone(phoneNumber)}
          </a>
        ) : (
          <p className="text-xl font-bold">
            Number is being assigned. Refresh in a minute.
          </p>
        )}
        <p className="muted text-sm">
          Call it to test, then forward your business line to it (most carriers
          support conditional call forwarding for missed or busy calls).
        </p>
      </div>
      <div className="grid-auto mt-4">
        {[
          ["Calls", calls.length],
          ["Minutes answered", minutes],
          ["New leads", openLeads],
          [
            "Credits used on calls",
            calls.reduce((s, c) => s + c.credits_used, 0),
          ],
        ].map(([label, value]) => (
          <div className="card p-5" key={label}>
            <p className="muted text-sm">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-bold">Leads & appointment requests</h2>
      <div className="mt-4 grid gap-3">
        {leads.length ? (
          leads.map((l) => (
            <article className="card grid gap-3 p-5" key={l.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {l.kind === "appointment" ? (
                    <CalendarClock className="mt-1 text-amber-400" size={20} />
                  ) : (
                    <UserPlus className="mt-1 text-amber-400" size={20} />
                  )}
                  <div>
                    <h3 className="font-bold">
                      {l.caller_name}
                      {l.urgency === "high" && (
                        <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">
                          Urgent
                        </span>
                      )}
                    </h3>
                    <a
                      className="text-sm underline"
                      href={`tel:${l.callback_number}`}
                    >
                      {l.callback_number}
                    </a>
                    {l.email && <p className="muted text-sm">{l.email}</p>}
                  </div>
                </div>
                <LeadStatus id={l.id} initial={l.status} />
              </div>
              <dl className="grid gap-1 text-sm">
                {l.kind === "appointment" ? (
                  <>
                    <Detail label="Service" value={l.service} />
                    <Detail label="Preferred time" value={l.preferred_time} />
                    <Detail label="Notes" value={l.notes} />
                  </>
                ) : (
                  <Detail label="Reason" value={l.reason} />
                )}
                <Detail
                  label="Received"
                  value={new Date(l.created_at).toLocaleString()}
                />
              </dl>
            </article>
          ))
        ) : (
          <p className="card muted p-6">
            Callers who leave details or request appointments appear here.
          </p>
        )}
      </div>
      <h2 className="mt-10 text-xl font-bold">Call log</h2>
      <div className="mt-4 grid gap-3">
        {calls.length ? (
          calls.map((c) => (
            <article className="card p-5" key={c.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PhoneIncoming className="text-amber-400" size={20} />
                  <div>
                    <p className="font-bold">
                      {formatPhone(c.caller_number) === "Number pending"
                        ? "Unknown caller"
                        : formatPhone(c.caller_number)}
                    </p>
                    <time className="muted text-xs">
                      {new Date(c.started_at ?? c.created_at).toLocaleString()}
                    </time>
                  </div>
                </div>
                <span className="muted text-sm capitalize">
                  {c.status === "ended"
                    ? formatDuration(c.duration_seconds)
                    : c.status.replaceAll("-", " ")}
                </span>
              </div>
              {c.summary && <p className="mt-3 text-sm">{c.summary}</p>}
              {(c.transcript || c.recording_url) && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-bold">
                    Transcript & recording
                  </summary>
                  {c.recording_url && (
                    <audio
                      className="mt-3 w-full"
                      controls
                      preload="none"
                      src={c.recording_url}
                    >
                      <a
                        href={c.recording_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Download recording
                      </a>
                    </audio>
                  )}
                  {c.transcript && (
                    <pre className="mt-3 text-sm whitespace-pre-wrap">
                      {c.transcript}
                    </pre>
                  )}
                </details>
              )}
            </article>
          ))
        ) : (
          <p className="card muted p-6">
            No calls yet. Call {formatPhone(phoneNumber)} to try your
            receptionist.
          </p>
        )}
      </div>
    </>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="muted">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}
