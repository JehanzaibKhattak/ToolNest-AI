import {
  FileSearch,
  Mail,
  Sparkles,
  Repeat2,
  FileText,
  type LucideIcon,
} from "lucide-react";
export type ToolSlug =
  | "pdf-assistant"
  | "resume-analyzer"
  | "email-writer"
  | "prompt-improver"
  | "content-repurposer";
export type ToolDefinition = {
  slug: ToolSlug;
  name: string;
  description: string;
  benefit: string;
  credits: number;
  icon: LucideIcon;
};
export const tools: ToolDefinition[] = [
  {
    slug: "pdf-assistant",
    name: "PDF Assistant",
    description:
      "Summarize documents, answer questions and extract useful insights.",
    benefit: "Understand long PDFs without reading every page",
    credits: 3,
    icon: FileText,
  },
  {
    slug: "resume-analyzer",
    name: "Resume Analyzer",
    description: "Get an ATS-style review tailored to your target role.",
    benefit: "Turn your resume into a stronger application",
    credits: 3,
    icon: FileSearch,
  },
  {
    slug: "email-writer",
    name: "Email Writer",
    description: "Write clear, professional emails for any situation.",
    benefit: "Send better emails in less time",
    credits: 1,
    icon: Mail,
  },
  {
    slug: "prompt-improver",
    name: "Prompt Improver",
    description: "Transform rough ideas into specific, reusable prompts.",
    benefit: "Get more useful AI responses",
    credits: 1,
    icon: Sparkles,
  },
  {
    slug: "content-repurposer",
    name: "Content Repurposer",
    description: "Adapt long-form content for every major channel.",
    benefit: "Create once and publish everywhere",
    credits: 2,
    icon: Repeat2,
  },
];
export const getTool = (slug: string) =>
  tools.find((tool) => tool.slug === slug);
