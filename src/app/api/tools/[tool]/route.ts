import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth/user";
import { createSupabaseServer } from "@/lib/supabase/server";
import { inputSchemas } from "@/lib/validations/tools";
import { outputSchemas } from "@/lib/ai/schemas/outputs";
import { generateStructured } from "@/lib/ai/generate";
import { CREDIT_COSTS } from "@/lib/credits";
import { getTool, type ToolSlug } from "@/lib/tools";
import type { ZodType } from "zod";
export const runtime = "nodejs";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tool: string }> },
) {
  const { tool: raw } = await params;
  const def = getTool(raw);
  if (!def) return Response.json({ error: "Unknown tool" }, { status: 404 });
  const tool = raw as ToolSlug;
  const user = await getUser();
  if (!user)
    return Response.json(
      { error: "Please sign in to generate." },
      { status: 401 },
    );
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = inputSchemas[tool].safeParse(body);
  if (!parsed.success)
    return Response.json(
      {
        error: "Check the highlighted fields.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  const supabase = await createSupabaseServer();
  if (!supabase)
    return Response.json(
      { error: "Service is not configured." },
      { status: 503 },
    );
  const { data: reservation, error: reserveError } = await supabase.rpc(
    "reserve_credits",
    { p_tool_name: tool, p_credits: CREDIT_COSTS[tool] },
  );
  if (reserveError || !reservation)
    return Response.json(
      { error: "You do not have enough credits." },
      { status: 402 },
    );
  try {
    const result = await generateStructured(
      tool,
      parsed.data,
      outputSchemas[tool] as ZodType<unknown>,
    );
    const { error } = await supabase.from("generations").insert({
      user_id: user.id,
      tool_name: tool,
      input_summary: `${def.name} generation`,
      output: result,
      metadata: { model: process.env.OPENAI_MODEL },
      credits_used: CREDIT_COSTS[tool],
    });
    if (error) throw new Error("SAVE_FAILED");
    await supabase.from("usage_events").insert({
      user_id: user.id,
      tool_name: tool,
      credits_used: CREDIT_COSTS[tool],
      status: "success",
    });
    return Response.json({ data: result });
  } catch (error) {
    await supabase.rpc("refund_credits", {
      p_tool_name: tool,
      p_credits: CREDIT_COSTS[tool],
    });
    const code = error instanceof Error ? error.message : "AI_FAILED";
    const message =
      code === "AI_NOT_CONFIGURED"
        ? "AI service is not configured."
        : "Generation could not be completed. Your credits were restored.";
    return Response.json({ error: message }, { status: 503 });
  }
}
