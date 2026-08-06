import { getUser } from "@/lib/auth/user";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
const MAX_BYTES = 5 * 1024 * 1024;

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
    return Response.json({ error: "Choose a file." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return Response.json(
      { error: "Files must be 5 MB or smaller." },
      { status: 413 },
    );
  if (!["application/pdf", "text/plain"].includes(file.type))
    return Response.json(
      { error: "Only PDF and TXT files are supported." },
      { status: 415 },
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    if (file.type === "text/plain")
      return Response.json({
        text: new TextDecoder("utf-8", { fatal: true })
          .decode(bytes)
          .slice(0, 30000),
      });
    const parser = new PDFParse({ data: bytes });
    try {
      const result = await parser.getText();
      return Response.json({ text: result.text.slice(0, 30000) });
    } finally {
      await parser.destroy();
    }
  } catch {
    return Response.json(
      { error: "We could not safely extract text from this file." },
      { status: 422 },
    );
  }
}
