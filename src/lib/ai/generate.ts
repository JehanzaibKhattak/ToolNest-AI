import { z, type ZodType } from "zod";
import { getOpenAI } from "./client";
import { prompts } from "./prompts";
import type { ToolSlug } from "@/lib/tools";
export async function generateStructured<T>(
  tool: ToolSlug,
  input: unknown,
  schema: ZodType<T>,
) {
  const model = process.env.OPENAI_MODEL;
  if (!model) throw new Error("AI_NOT_CONFIGURED");
  const response = await getOpenAI().responses.create({
    model,
    instructions: prompts[tool],
    input: `Return only valid JSON matching this requirement: ${JSON.stringify(z.toJSONSchema(schema))}\n\nUser input:\n${JSON.stringify(input)}`,
  });
  try {
    return schema.parse(JSON.parse(response.output_text));
  } catch {
    throw new Error("MALFORMED_AI_OUTPUT");
  }
}
