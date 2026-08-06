import "server-only";
import { getOpenAI } from "./client";
const MIN_OCR_LENGTH = 100;
const MAX_OCR_LENGTH = 50000;
export async function extractScannedPdfText(
  bytes: Uint8Array,
  filename: string,
) {
  const model = process.env.OPENAI_MODEL;
  if (!model) throw new Error("OCR_NOT_CONFIGURED");
  const response = await getOpenAI().responses.create({
    model,
    instructions:
      "Perform faithful OCR only. Extract readable text in natural reading order. Preserve headings, lists and table rows where possible. Do not summarize, explain, infer, translate or add content. Return plain text only.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename,
            file_data: `data:application/pdf;base64,${Buffer.from(bytes).toString("base64")}`,
            detail: "high",
          },
          {
            type: "input_text",
            text: "Extract all readable text from this scanned PDF. If a portion is unreadable, mark it [unreadable].",
          },
        ],
      },
    ],
  });
  const text = response.output_text
    .replaceAll("\u0000", "")
    .trim()
    .slice(0, MAX_OCR_LENGTH);
  if (text.length < MIN_OCR_LENGTH) throw new Error("OCR_INSUFFICIENT_TEXT");
  return { text, truncated: response.output_text.length > MAX_OCR_LENGTH };
}
