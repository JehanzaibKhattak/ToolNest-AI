"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import {
  receptionistCreateSchema,
  type ReceptionistCreateInput,
} from "@/lib/validations/receptionist";
import { VOICES } from "@/lib/voice/config";
import { RECEPTIONIST_TEMPLATES } from "@/lib/voice/templates";
type Output = z.output<typeof receptionistCreateSchema>;
const blank: ReceptionistCreateInput = {
  name: "",
  businessName: "",
  industry: "",
  greeting: "",
  services: "",
  businessHours: "",
  faqs: "",
  bookingInstructions: "",
  transferNumber: "",
  voiceId: "Elliot",
  recordingEnabled: true,
  areaCode: "",
};
export function ReceptionistForm({
  mode,
  receptionistId,
  initial,
  setupCredits,
}: {
  mode: "create" | "edit";
  receptionistId?: string;
  initial?: ReceptionistCreateInput;
  setupCredits?: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ReceptionistCreateInput, unknown, Output>({
    resolver: zodResolver(receptionistCreateSchema),
    defaultValues: initial ?? blank,
  });
  function applyTemplate(id: string) {
    const template = RECEPTIONIST_TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    const { industry, services, businessHours, faqs, bookingInstructions } =
      template;
    Object.entries({
      industry,
      services,
      businessHours,
      faqs,
      bookingInstructions,
    }).forEach(([key, value]) =>
      setValue(key as keyof ReceptionistCreateInput, value, {
        shouldValidate: true,
      }),
    );
    const business = getValues("businessName");
    if (!getValues("greeting"))
      setValue(
        "greeting",
        `Thanks for calling ${business || "us"}, this is the virtual receptionist. How can I help you today?`,
      );
  }
  async function submit(values: Output) {
    setError("");
    try {
      const response = await fetch(
        mode === "create"
          ? "/api/receptionists"
          : `/api/receptionists/${receptionistId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const payload = (await response.json()) as {
        data?: { id: string };
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "Request failed");
      toast.success(
        mode === "create" ? "Receptionist is live" : "Receptionist updated",
      );
      router.push(
        `/dashboard/receptionists/${payload.data?.id ?? receptionistId}`,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  }
  return (
    <form
      className="card grid max-w-3xl gap-5 p-5 md:p-7"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      {mode === "create" && (
        <Field label="Start from a template (optional)">
          <select
            className="field"
            defaultValue=""
            onChange={(e) => applyTemplate(e.target.value)}
          >
            <option value="">Blank</option>
            {RECEPTIONIST_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Receptionist name" error={errors.name?.message}>
          <input
            className="field"
            placeholder="Front desk"
            maxLength={40}
            {...register("name")}
          />
        </Field>
        <Field label="Business name" error={errors.businessName?.message}>
          <input className="field" {...register("businessName")} />
        </Field>
        <Field label="Industry" error={errors.industry?.message}>
          <input
            className="field"
            placeholder="dental clinic"
            {...register("industry")}
          />
        </Field>
        <Field label="Voice" error={errors.voiceId?.message}>
          <select className="field" {...register("voiceId")}>
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label="Greeting (first thing callers hear)"
        error={errors.greeting?.message}
      >
        <textarea className="field min-h-20" {...register("greeting")} />
      </Field>
      <Field label="Services and pricing" error={errors.services?.message}>
        <textarea className="field min-h-28" {...register("services")} />
      </Field>
      <Field label="Business hours" error={errors.businessHours?.message}>
        <textarea className="field min-h-20" {...register("businessHours")} />
      </Field>
      <Field label="FAQs (optional)" error={errors.faqs?.message}>
        <textarea
          className="field min-h-28"
          placeholder="Parking, insurance, cancellation policy…"
          {...register("faqs")}
        />
      </Field>
      <Field
        label="Booking instructions (optional)"
        error={errors.bookingInstructions?.message}
      >
        <textarea
          className="field min-h-20"
          {...register("bookingInstructions")}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Transfer to a human (optional)"
          hint="Calls are forwarded here for emergencies or on request."
          error={errors.transferNumber?.message}
        >
          <input
            className="field"
            type="tel"
            placeholder="+14155550123"
            {...register("transferNumber")}
          />
        </Field>
        {mode === "create" && (
          <Field
            label="Preferred US area code (optional)"
            error={errors.areaCode?.message}
          >
            <input
              className="field"
              inputMode="numeric"
              maxLength={3}
              placeholder="415"
              {...register("areaCode")}
            />
          </Field>
        )}
      </div>
      <label className="flex items-start gap-3">
        <input
          className="mt-1 size-4"
          type="checkbox"
          {...register("recordingEnabled")}
        />
        <span>
          <span className="font-semibold">Record calls</span>
          <span className="muted block text-sm">
            Recording laws vary. Mention recording in your greeting where
            consent is required.
          </span>
        </span>
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/50 p-3 text-red-400"
        >
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
        {mode === "create"
          ? `Create receptionist & phone number${setupCredits ? ` · ${setupCredits} credits` : ""}`
          : "Save changes"}
      </button>
    </form>
  );
}
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid content-start gap-2">
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="muted text-sm">{hint}</span>}
      {error && <span className="text-sm text-red-400">{error}</span>}
    </label>
  );
}
