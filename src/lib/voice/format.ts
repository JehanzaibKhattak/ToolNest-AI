export function formatPhone(number: string | null | undefined) {
  if (!number) return "Number pending";
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(number);
  return us ? `+1 (${us[1]}) ${us[2]}-${us[3]}` : number;
}
export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.max(0, Math.round(seconds % 60));
  return m ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}
