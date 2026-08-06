import OpenAI from "openai";
let client: OpenAI | undefined;
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("AI_NOT_CONFIGURED");
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 2,
  });
  return client;
}
