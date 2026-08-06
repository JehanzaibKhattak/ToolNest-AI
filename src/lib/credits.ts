import type { ToolSlug } from "./tools";
export const CREDIT_COSTS: Record<ToolSlug, number> = {
  "pdf-assistant": 3,
  "resume-analyzer": 3,
  "email-writer": 1,
  "prompt-improver": 1,
  "content-repurposer": 2,
};
export function hasCredits(credits: number, tool: ToolSlug) {
  return credits >= CREDIT_COSTS[tool];
}
