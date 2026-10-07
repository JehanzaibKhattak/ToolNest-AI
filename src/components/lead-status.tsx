"use client";
import { useState } from "react";
import { toast } from "sonner";
const statuses = ["new", "contacted", "closed"] as const;
type Status = (typeof statuses)[number];
export function LeadStatus({ id, initial }: { id: string; initial: Status }) {
  const [status, setStatus] = useState<Status>(initial);
  const [saving, setSaving] = useState(false);
  async function change(next: Status) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    const response = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!response.ok) {
      setStatus(previous);
      toast.error("Could not update lead");
    }
  }
  return (
    <select
      aria-label="Lead status"
      className="field w-auto py-2 capitalize"
      value={status}
      disabled={saving}
      onChange={(e) => change(e.target.value as Status)}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
