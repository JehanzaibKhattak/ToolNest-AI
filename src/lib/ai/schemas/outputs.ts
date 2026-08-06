import { z } from "zod";
export const pdfOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  answer: z.string().optional(),
  actionItems: z.array(z.string()),
  importantTerms: z.array(
    z.object({ term: z.string(), explanation: z.string() }),
  ),
  sourceNotes: z.array(z.string()),
  caveat: z.string(),
});
export const resumeOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scoreExplanation: z.string(),
  professionalSummaryEvaluation: z.string(),
  skillsMatchScore: z.number().min(0).max(100),
  experienceRelevanceScore: z.number().min(0).max(100),
  formattingReadabilityScore: z.number().min(0).max(100),
  keywordCoverage: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strongPoints: z.array(z.string()),
  weakPoints: z.array(z.string()),
  recommendations: z.array(z.string()),
  improvedProfessionalSummary: z.string(),
  suggestedSkills: z.array(z.string()),
  suggestedAchievementBullets: z.array(z.string()),
  verdict: z.string(),
  disclaimer: z.string(),
});
export const emailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  alternativeSubject: z.string().optional(),
  shorterVersion: z.string().optional(),
});
export const promptOutputSchema = z.object({
  improvedPrompt: z.string(),
  explanation: z.string(),
  variables: z.array(z.string()),
  shorterPrompt: z.string().optional(),
  advancedPrompt: z.string().optional(),
});
export const contentOutputSchema = z.object({
  outputs: z.array(
    z.object({ format: z.string(), variations: z.array(z.string()) }),
  ),
});
export const outputSchemas = {
  "pdf-assistant": pdfOutputSchema,
  "resume-analyzer": resumeOutputSchema,
  "email-writer": emailOutputSchema,
  "prompt-improver": promptOutputSchema,
  "content-repurposer": contentOutputSchema,
};
