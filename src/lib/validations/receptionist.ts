import { z } from "zod";
import { VOICE_IDS } from "@/lib/voice/config";
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalText = (max: number) => z.string().trim().max(max).default("");
export const e164 = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Use international format, e.g. +14155550123.");
const baseShape = {
  name: text(2, 40),
  businessName: text(2, 120),
  industry: text(2, 80),
  greeting: text(10, 300),
  services: text(10, 3000),
  businessHours: text(3, 1000),
  faqs: optionalText(6000),
  bookingInstructions: optionalText(2000),
  transferNumber: z.union([z.literal(""), e164]).default(""),
  voiceId: z.enum(VOICE_IDS),
  recordingEnabled: z.boolean().default(true),
};
export const receptionistUpdateSchema = z.object(baseShape);
export const receptionistCreateSchema = z.object({
  ...baseShape,
  areaCode: z
    .union([z.literal(""), z.string().regex(/^\d{3}$/, "Use 3 digits.")])
    .default(""),
});
export type ReceptionistSettings = z.output<typeof receptionistUpdateSchema>;
export type ReceptionistCreateInput = z.input<typeof receptionistCreateSchema>;
export const receptionistStatusSchema = z.object({ active: z.boolean() });
export const leadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});
export function settingsToRow(s: ReceptionistSettings) {
  return {
    name: s.name,
    business_name: s.businessName,
    industry: s.industry,
    greeting: s.greeting,
    services: s.services,
    business_hours: s.businessHours,
    faqs: s.faqs,
    booking_instructions: s.bookingInstructions,
    transfer_number: s.transferNumber,
    voice_id: s.voiceId,
    recording_enabled: s.recordingEnabled,
  };
}
export const receptionistRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  business_name: z.string(),
  industry: z.string(),
  greeting: z.string(),
  services: z.string(),
  business_hours: z.string(),
  faqs: z.string(),
  booking_instructions: z.string(),
  transfer_number: z.string(),
  voice_id: z.enum(VOICE_IDS),
  recording_enabled: z.boolean(),
  status: z.enum(["provisioning", "active", "paused", "failed"]),
  vapi_assistant_id: z.string().nullable(),
  vapi_phone_number_id: z.string().nullable(),
  phone_number: z.string().nullable(),
});
export type ReceptionistRow = z.infer<typeof receptionistRowSchema>;
export const RECEPTIONIST_COLUMNS =
  "id,name,business_name,industry,greeting,services,business_hours,faqs,booking_instructions,transfer_number,voice_id,recording_enabled,status,vapi_assistant_id,vapi_phone_number_id,phone_number";
export function rowToSettings(r: ReceptionistRow): ReceptionistSettings {
  return {
    name: r.name,
    businessName: r.business_name,
    industry: r.industry,
    greeting: r.greeting,
    services: r.services,
    businessHours: r.business_hours,
    faqs: r.faqs,
    bookingInstructions: r.booking_instructions,
    transferNumber: r.transfer_number,
    voiceId: r.voice_id,
    recordingEnabled: r.recording_enabled,
  };
}
