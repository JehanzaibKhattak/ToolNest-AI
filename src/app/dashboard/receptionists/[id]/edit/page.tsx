import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  RECEPTIONIST_COLUMNS,
  receptionistRowSchema,
  rowToSettings,
} from "@/lib/validations/receptionist";
import { ReceptionistForm } from "@/components/receptionist-form";
export default async function EditReceptionist({
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
  const row = receptionistRowSchema.safeParse(data);
  if (!row.success) notFound();
  return (
    <>
      <Link className="muted text-sm" href={`/dashboard/receptionists/${id}`}>
        ← Back to {row.data.name}
      </Link>
      <p className="eyebrow mt-4">Settings</p>
      <h1 className="mt-2 mb-7 text-3xl font-black">Edit receptionist</h1>
      <ReceptionistForm
        mode="edit"
        receptionistId={id}
        initial={{ ...rowToSettings(row.data), areaCode: "" }}
      />
    </>
  );
}
