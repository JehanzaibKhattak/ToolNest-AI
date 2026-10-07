"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
export function ReceptionistControls({
  id,
  status,
}: {
  id: string;
  status: "provisioning" | "active" | "paused" | "failed";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "status" | "delete">("");
  async function call(url: string, init: RequestInit) {
    const response = await fetch(url, init);
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (!response.ok) throw new Error(payload.error || "Request failed");
  }
  async function toggle() {
    setBusy("status");
    try {
      await call(`/api/receptionists/${id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: status !== "active" }),
      });
      toast.success(
        status === "active" ? "Calls paused" : "Taking calls again",
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy("");
    }
  }
  async function remove() {
    if (
      !confirm(
        "Delete this receptionist? Its phone number is released and call history is removed permanently.",
      )
    )
      return;
    setBusy("delete");
    try {
      await call(`/api/receptionists/${id}`, { method: "DELETE" });
      toast.success("Receptionist deleted");
      router.push("/dashboard/receptionists");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
      setBusy("");
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {(status === "active" || status === "paused") && (
        <button className="btn" onClick={toggle} disabled={!!busy}>
          {busy === "status" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : status === "active" ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
          {status === "active" ? "Pause calls" : "Resume calls"}
        </button>
      )}
      <Link className="btn" href={`/dashboard/receptionists/${id}/edit`}>
        <Pencil size={16} />
        Edit
      </Link>
      <button className="btn" onClick={remove} disabled={!!busy}>
        {busy === "delete" ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Trash2 size={16} />
        )}
        Delete
      </button>
    </div>
  );
}
