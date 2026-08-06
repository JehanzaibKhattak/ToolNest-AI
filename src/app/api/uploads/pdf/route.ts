import { getUser } from "@/lib/auth/user";
import { PDFParse } from "pdf-parse";
import { extractScannedPdfText } from "@/lib/ai/ocr";
import { createSupabaseServer } from "@/lib/supabase/server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { CREDIT_COSTS } from "@/lib/credits";
import { safeFileName } from "@/lib/utils";

export const runtime = "nodejs";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 50000;

export async function POST(request: Request) {
  const user = await getUser();
  if (!user)
    return Response.json(
      { error: "Please sign in to upload." },
      { status: 401 },
    );
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return Response.json({ error: "Choose a PDF." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return Response.json(
      { error: "PDFs must be 10 MB or smaller." },
      { status: 413 },
    );
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return Response.json(
      { error: "Only PDF files are supported." },
      { status: 415 },
    );
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    const text = result.text.trim().slice(0, MAX_TEXT_LENGTH);
    if (text.length >= 100)
      return Response.json({
        text,
        truncated: result.text.length > MAX_TEXT_LENGTH,
        extractionMethod: "native",
      });
    const rateLimit = consumeRateLimit(`pdf-ocr:${user.id}`, 3, 60_000);
    if (!rateLimit.allowed)
      return Response.json(
        { error: "Too many scanned-PDF requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    const supabase = await createSupabaseServer();
    const { data: profile } = await supabase!
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();
    if (!profile || profile.credits < CREDIT_COSTS["pdf-assistant"])
      return Response.json(
        { error: "You need 3 available credits to OCR a scanned PDF." },
        { status: 402 },
      );
    const ocr = await extractScannedPdfText(bytes, safeFileName(file.name));
    return Response.json({ ...ocr, extractionMethod: "ocr" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "OCR_FAILED";
    const message =
      code === "OCR_NOT_CONFIGURED"
        ? "OCR is not configured. Add OPENAI_API_KEY and OPENAI_MODEL."
        : code === "OCR_INSUFFICIENT_TEXT"
          ? "OCR could not find enough readable text in this PDF."
          : "We could not safely extract text from this PDF.";
    return Response.json({ error: message }, { status: 422 });
  } finally {
    await parser.destroy();
  }
}
