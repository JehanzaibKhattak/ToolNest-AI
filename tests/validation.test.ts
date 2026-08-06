import { describe, expect, it } from "vitest";
import {
  resumeInputSchema,
  contentInputSchema,
  pdfInputSchema,
} from "@/lib/validations/tools";
import { CREDIT_COSTS, hasCredits } from "@/lib/credits";
import { safeFileName, safeSummary } from "@/lib/utils";
import { clearRateLimitsForTests, consumeRateLimit } from "@/lib/rate-limit";
describe("tool boundaries", () => {
  it("rejects short resumes", () =>
    expect(
      resumeInputSchema.safeParse({
        resumeText: "short",
        targetJobTitle: "Engineer",
        jobDescription: "",
        experienceLevel: "mid",
      }).success,
    ).toBe(false));
  it("requires repurposing formats", () =>
    expect(
      contentInputSchema.safeParse({
        sourceContent: "x".repeat(100),
        formats: [],
        audience: "",
        tone: "Formal",
        callToAction: "",
        keywords: "",
        outputLength: "short",
        variations: 1,
      }).success,
    ).toBe(false));
  it("requires a question for PDF question answering", () => {
    const result = pdfInputSchema.safeParse({
      documentText: "Document content ".repeat(10),
      task: "answer-question",
      question: "",
      audience: "General reader",
      detailLevel: "balanced",
    });
    expect(result.success).toBe(false);
  });
  it("calculates credits", () => {
    expect(CREDIT_COSTS["resume-analyzer"]).toBe(3);
    expect(CREDIT_COSTS["pdf-assistant"]).toBe(3);
    expect(hasCredits(2, "resume-analyzer")).toBe(false);
  });
  it("sanitizes names and summaries", () => {
    expect(safeFileName("../my cv.pdf")).toBe(".._my_cv.pdf");
    expect(safeSummary("Email")).not.toContain("private");
  });
  it("limits repeated OCR attempts per user", () => {
    clearRateLimitsForTests();
    expect(consumeRateLimit("ocr:user", 2, 60000, 1000).allowed).toBe(true);
    expect(consumeRateLimit("ocr:user", 2, 60000, 1001).allowed).toBe(true);
    expect(consumeRateLimit("ocr:user", 2, 60000, 1002).allowed).toBe(false);
    expect(consumeRateLimit("ocr:user", 2, 60000, 61001).allowed).toBe(true);
  });
});
