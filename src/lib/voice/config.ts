export const VOICES = [
  { id: "Elliot", label: "Elliot · calm, male" },
  { id: "Kylie", label: "Kylie · warm, female" },
  { id: "Rohan", label: "Rohan · bright, male" },
  { id: "Lily", label: "Lily · upbeat, female" },
  { id: "Savannah", label: "Savannah · friendly, female" },
  { id: "Hana", label: "Hana · soft, female" },
  { id: "Neha", label: "Neha · professional, female" },
  { id: "Cole", label: "Cole · deep, male" },
  { id: "Harry", label: "Harry · clear, male" },
  { id: "Paige", label: "Paige · relaxed, female" },
  { id: "Spencer", label: "Spencer · energetic, male" },
] as const;
export type VoiceId = (typeof VOICES)[number]["id"];
export const VOICE_IDS = VOICES.map((v) => v.id) as [VoiceId, ...VoiceId[]];
export const RECEPTIONIST_SETUP_CREDITS = 10;
export const CALL_CREDITS_PER_MINUTE = 1;
export const MAX_RECEPTIONISTS_PER_USER = 3;
export const MAX_CALL_SECONDS = 900;
export function callCredits(durationSeconds: number) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.ceil(durationSeconds / 60) * CALL_CREDITS_PER_MINUTE;
}
export type VoiceConfig = {
  apiKey: string;
  webhookSecret: string;
  model: string;
  webhookUrl: string;
};
export function getVoiceConfig(): VoiceConfig {
  const apiKey = process.env.VAPI_API_KEY;
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
  const model = process.env.VAPI_LLM_MODEL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (
    !apiKey ||
    !webhookSecret ||
    webhookSecret.length < 24 ||
    !model ||
    !appUrl
  )
    throw new Error("VOICE_NOT_CONFIGURED");
  return {
    apiKey,
    webhookSecret,
    model,
    webhookUrl: new URL("/api/vapi/webhook", appUrl).toString(),
  };
}
