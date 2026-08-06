import { z } from "zod";
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const pdfInputSchema = z
  .object({
    documentText: text(100, 50000),
    task: z.enum([
      "summarize",
      "answer-question",
      "extract-key-points",
      "action-items",
      "study-notes",
    ]),
    question: z.string().trim().max(2000).default(""),
    audience: z.string().trim().max(300).default("General reader"),
    detailLevel: z.enum(["concise", "balanced", "detailed"]),
  })
  .superRefine((value, context) => {
    if (value.task === "answer-question" && value.question.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["question"],
        message: "Enter a question about the PDF.",
      });
    }
  });
export const resumeInputSchema = z.object({
  resumeText: text(100, 30000),
  targetJobTitle: text(2, 120),
  jobDescription: z.string().max(15000).default(""),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]),
});
export const emailInputSchema = z.object({
  emailType: text(2, 60),
  recipient: text(1, 120),
  purpose: text(10, 3000),
  details: z.string().max(5000).default(""),
  desiredAction: z.string().max(1000).default(""),
  tone: text(2, 30),
  length: z.enum(["short", "medium", "long"]),
  language: text(2, 40),
});
export const promptInputSchema = z.object({
  prompt: text(10, 10000),
  platform: text(2, 60),
  desiredResult: z.string().max(2000).default(""),
  audience: z.string().max(500).default(""),
  outputFormat: z.string().max(500).default(""),
  detailLevel: z.enum(["concise", "balanced", "detailed"]),
  constraints: z.string().max(2000).default(""),
});
export const contentInputSchema = z.object({
  sourceContent: text(100, 20000),
  formats: z.array(z.string()).min(1).max(8),
  audience: z.string().max(500).default(""),
  tone: text(2, 30),
  callToAction: z.string().max(500).default(""),
  keywords: z.string().max(500).default(""),
  outputLength: z.enum(["short", "medium", "long"]),
  variations: z.number().int().min(1).max(3),
});
export const inputSchemas = {
  "pdf-assistant": pdfInputSchema,
  "resume-analyzer": resumeInputSchema,
  "email-writer": emailInputSchema,
  "prompt-improver": promptInputSchema,
  "content-repurposer": contentInputSchema,
};
