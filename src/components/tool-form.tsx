"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Copy, Loader2, Printer, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { ToolSlug } from "@/lib/tools";
type Values = Record<string, string | number | string[]>;
const options = {
  tone: [
    "Professional",
    "Friendly",
    "Formal",
    "Persuasive",
    "Concise",
    "Confident",
    "Apologetic",
  ],
  formats: [
    "LinkedIn post",
    "Instagram caption",
    "X/Twitter post",
    "Facebook post",
    "YouTube description",
    "Short-video script",
    "Email newsletter",
    "Blog summary",
  ],
};
export function ToolForm({ tool }: { tool: ToolSlug }) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<Values>();
  const selectedPdfTask = useWatch({ control, name: "task" });
  const [result, setResult] = useState<unknown>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(values: Values) {
    setLoading(true);
    setError("");
    const normalized = {
      ...values,
      variations: Number(values.variations || 1),
      formats: Array.isArray(values.formats)
        ? values.formats
        : [values.formats].filter(Boolean),
    };
    try {
      const response = await fetch(`/api/tools/${tool}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(normalized),
      });
      const payload = (await response.json()) as {
        data?: unknown;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "Generation failed");
      setResult(payload.data);
      toast.success("Generation complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }
  async function uploadResume(file?: File) {
    if (!file) return;
    setLoading(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/uploads/resume", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        text?: string;
        error?: string;
      };
      if (!response.ok || !payload.text)
        throw new Error(payload.error || "Extraction failed");
      setValue("resumeText", payload.text, { shouldValidate: true });
      toast.success("Resume text extracted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }
  async function uploadPdf(file?: File) {
    if (!file) return;
    setLoading(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/uploads/pdf", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        text?: string;
        error?: string;
        truncated?: boolean;
        extractionMethod?: "native" | "ocr";
      };
      if (!response.ok || !payload.text)
        throw new Error(payload.error || "Extraction failed");
      setValue("documentText", payload.text, { shouldValidate: true });
      const extractionMessage =
        payload.extractionMethod === "ocr"
          ? "Scanned PDF converted with OCR"
          : "PDF text extracted";
      toast.success(
        payload.truncated
          ? `${extractionMessage}; text was limited to 50,000 characters`
          : extractionMessage,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }
  const required = { required: "This field is required" };
  return (
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <form
        className="card grid gap-5 p-5 md:p-7"
        onSubmit={handleSubmit(submit)}
      >
        {tool === "pdf-assistant" && (
          <>
            <Field label="Upload PDF">
              <input
                className="field"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => uploadPdf(event.target.files?.[0])}
              />
            </Field>
            <Field
              label="Extracted document text"
              error={errors.documentText?.message}
            >
              <textarea
                className="field min-h-44"
                placeholder="Extracted PDF text appears here…"
                {...register("documentText", {
                  ...required,
                  minLength: {
                    value: 100,
                    message:
                      "The PDF needs at least 100 characters of extractable text",
                  },
                  maxLength: {
                    value: 50000,
                    message: "Maximum 50,000 characters",
                  },
                })}
              />
            </Field>
            <Select
              label="What should the assistant do?"
              name="task"
              register={register}
              values={[
                "summarize",
                "answer-question",
                "extract-key-points",
                "action-items",
                "study-notes",
              ]}
            />
            {selectedPdfTask === "answer-question" && (
              <Field label="Question" error={errors.question?.message}>
                <textarea
                  className="field min-h-24"
                  {...register("question", required)}
                />
              </Field>
            )}
            <Field label="Intended audience">
              <input
                className="field"
                defaultValue="General reader"
                {...register("audience")}
              />
            </Field>
            <Select
              label="Detail level"
              name="detailLevel"
              register={register}
              values={["concise", "balanced", "detailed"]}
            />
          </>
        )}
        {tool === "resume-analyzer" && (
          <>
            <Field label="Upload PDF or TXT (optional)">
              <input
                className="field"
                type="file"
                accept="application/pdf,text/plain,.pdf,.txt"
                onChange={(event) => uploadResume(event.target.files?.[0])}
              />
            </Field>
            <Field label="Resume text" error={errors.resumeText?.message}>
              <textarea
                className="field min-h-56"
                placeholder="Paste at least 100 characters…"
                {...register("resumeText", {
                  ...required,
                  minLength: {
                    value: 100,
                    message: "Use at least 100 characters",
                  },
                  maxLength: {
                    value: 30000,
                    message: "Maximum 30,000 characters",
                  },
                })}
              />
            </Field>
            <Field
              label="Target job title"
              error={errors.targetJobTitle?.message}
            >
              <input
                className="field"
                {...register("targetJobTitle", required)}
              />
            </Field>
            <Field label="Job description (optional)">
              <textarea
                className="field min-h-28"
                {...register("jobDescription")}
              />
            </Field>
            <Select
              label="Experience level"
              name="experienceLevel"
              register={register}
              values={["entry", "mid", "senior", "executive"]}
            />
          </>
        )}
        {tool === "email-writer" && (
          <>
            <Select
              label="Email type"
              name="emailType"
              register={register}
              values={[
                "Job application",
                "Follow-up",
                "University inquiry",
                "Complaint",
                "Client proposal",
                "Sales outreach",
                "Meeting request",
                "Thank-you email",
                "Custom email",
              ]}
            />
            <Field label="Recipient role or name">
              <input className="field" {...register("recipient", required)} />
            </Field>
            <Field label="Purpose">
              <textarea className="field" {...register("purpose", required)} />
            </Field>
            <Field label="Important details">
              <textarea className="field" {...register("details")} />
            </Field>
            <Field label="Desired action">
              <input className="field" {...register("desiredAction")} />
            </Field>
            <Select
              label="Tone"
              name="tone"
              register={register}
              values={options.tone}
            />
            <Select
              label="Length"
              name="length"
              register={register}
              values={["short", "medium", "long"]}
            />
            <Field label="Language">
              <input
                className="field"
                defaultValue="English"
                {...register("language", required)}
              />
            </Field>
          </>
        )}
        {tool === "prompt-improver" && (
          <>
            <Field label="Basic prompt" error={errors.prompt?.message}>
              <textarea
                className="field min-h-44"
                {...register("prompt", {
                  ...required,
                  minLength: {
                    value: 10,
                    message: "Use at least 10 characters",
                  },
                })}
              />
            </Field>
            <Select
              label="Platform or purpose"
              name="platform"
              register={register}
              values={[
                "General ChatGPT prompt",
                "Coding prompt",
                "Image-generation prompt",
                "Marketing prompt",
                "Research prompt",
                "Business-analysis prompt",
                "Social-media prompt",
                "Video-generation prompt",
              ]}
            />
            {["desiredResult", "audience", "outputFormat", "constraints"].map(
              (name) => (
                <Field
                  key={name}
                  label={name
                    .replace(/[A-Z]/g, (x) => ` ${x}`)
                    .replace(/^./, (x) => x.toUpperCase())}
                >
                  <input className="field" {...register(name)} />
                </Field>
              ),
            )}
            <Select
              label="Detail level"
              name="detailLevel"
              register={register}
              values={["concise", "balanced", "detailed"]}
            />
          </>
        )}
        {tool === "content-repurposer" && (
          <>
            <Field label="Source content" error={errors.sourceContent?.message}>
              <textarea
                className="field min-h-56"
                {...register("sourceContent", {
                  ...required,
                  minLength: {
                    value: 100,
                    message: "Use at least 100 characters",
                  },
                })}
              />
            </Field>
            <fieldset>
              <legend className="mb-2 font-semibold">Output formats</legend>
              <div className="grid grid-cols-2 gap-2">
                {options.formats.map((x) => (
                  <label className="flex gap-2 text-sm" key={x}>
                    <input
                      type="checkbox"
                      value={x}
                      {...register("formats", required)}
                    />
                    {x}
                  </label>
                ))}
              </div>
            </fieldset>
            {["audience", "callToAction", "keywords"].map((name) => (
              <Field
                key={name}
                label={name
                  .replace(/[A-Z]/g, (x) => ` ${x}`)
                  .replace(/^./, (x) => x.toUpperCase())}
              >
                <input className="field" {...register(name)} />
              </Field>
            ))}
            <Select
              label="Tone"
              name="tone"
              register={register}
              values={options.tone}
            />
            <Select
              label="Output length"
              name="outputLength"
              register={register}
              values={["short", "medium", "long"]}
            />
            <Select
              label="Variations"
              name="variations"
              register={register}
              values={["1", "2", "3"]}
            />
          </>
        )}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating…
            </>
          ) : (
            "Generate"
          )}
        </button>
        <p className="muted text-xs">
          Your input is sent securely to the server. Review AI-generated output
          before use.
        </p>
      </form>
      <section aria-live="polite" className="card min-h-96 p-5 md:p-7">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-400"
          >
            {error}
          </div>
        )}
        {!result && !error && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-lg font-bold">Your result will appear here</p>
              <p className="muted mt-2">
                Complete the form to create a structured draft.
              </p>
            </div>
          </div>
        )}
        {result !== undefined && (
          <>
            <div className="mb-5 flex flex-wrap justify-between gap-2">
              <h2 className="text-2xl font-bold">Your result</h2>
              <div className="flex gap-2">
                <button
                  className="btn"
                  onClick={() => {
                    navigator.clipboard.writeText(format(result));
                    toast.success("Copied");
                  }}
                >
                  <Copy size={16} /> Copy
                </button>
                <button className="btn" onClick={() => window.print()}>
                  <Printer size={16} />
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setResult(undefined);
                    reset();
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            <pre className="font-sans leading-7 whitespace-pre-wrap">
              {format(result)}
            </pre>
          </>
        )}
      </section>
    </div>
  );
}
function format(value: unknown, depth = 0): string {
  if (Array.isArray(value))
    return value
      .map((x) => `• ${typeof x === "object" ? format(x, depth + 1) : x}`)
      .join("\n");
  if (value && typeof value === "object")
    return Object.entries(value)
      .map(
        ([k, v]) =>
          `${depth ? "" : "\n"}${k.replace(/[A-Z]/g, (x) => ` ${x}`).replace(/^./, (x) => x.toUpperCase())}\n${format(v, depth + 1)}`,
      )
      .join("\n");
  return String(value ?? "");
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | number | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-semibold">{label}</span>
      {children}
      {error && <span className="text-sm text-red-400">{String(error)}</span>}
    </label>
  );
}
function Select({
  label,
  name,
  register,
  values,
}: {
  label: string;
  name: string;
  register: ReturnType<typeof useForm<Values>>["register"];
  values: string[];
}) {
  return (
    <Field label={label}>
      <select
        className="field"
        {...register(name, { required: "This field is required" })}
      >
        <option value="">Select…</option>
        {values.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </Field>
  );
}
