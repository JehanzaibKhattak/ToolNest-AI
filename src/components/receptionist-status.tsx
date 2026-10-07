const styles = {
  active: "bg-emerald-500/15 text-emerald-500",
  paused: "bg-amber-400/20 text-amber-500",
  provisioning: "bg-sky-500/15 text-sky-500",
  failed: "bg-red-500/15 text-red-400",
} as const;
const labels = {
  active: "Taking calls",
  paused: "Paused",
  provisioning: "Setting up",
  failed: "Needs attention",
} as const;
export function ReceptionistStatus({
  status,
}: {
  status: keyof typeof styles;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
