import { z, type ZodType } from "zod";
import type { AssistantPayload } from "./prompt";
const BASE_URL = "https://api.vapi.ai";
export class VapiError extends Error {
  constructor(readonly status: number) {
    super(`VAPI_${status}`);
  }
}
const idSchema = z.object({ id: z.string().min(1) });
const phoneSchema = z.object({
  id: z.string().min(1),
  number: z.string().nullish(),
});
async function request<T>(
  apiKey: string,
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  schema: ZodType<T>,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok) throw new VapiError(response.status);
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error("VAPI_BAD_RESPONSE");
  return parsed.data;
}
async function remove(apiKey: string, path: string) {
  try {
    await request(apiKey, path, "DELETE", z.unknown());
  } catch (error) {
    if (!(error instanceof VapiError && error.status === 404)) throw error;
  }
}
export const createAssistant = (apiKey: string, payload: AssistantPayload) =>
  request(apiKey, "/assistant", "POST", idSchema, payload);
export const updateAssistant = (
  apiKey: string,
  id: string,
  payload: AssistantPayload,
) =>
  request(
    apiKey,
    `/assistant/${encodeURIComponent(id)}`,
    "PATCH",
    idSchema,
    payload,
  );
export const deleteAssistant = (apiKey: string, id: string) =>
  remove(apiKey, `/assistant/${encodeURIComponent(id)}`);
export function createPhoneNumber(
  apiKey: string,
  input: { assistantId: string; name: string; areaCode: string },
) {
  return request(apiKey, "/phone-number", "POST", phoneSchema, {
    provider: "vapi",
    name: input.name,
    assistantId: input.assistantId,
    ...(input.areaCode ? { numberDesiredAreaCode: input.areaCode } : {}),
  });
}
export const getPhoneNumber = (apiKey: string, id: string) =>
  request(
    apiKey,
    `/phone-number/${encodeURIComponent(id)}`,
    "GET",
    phoneSchema,
  );
export const setPhoneNumberAssistant = (
  apiKey: string,
  id: string,
  assistantId: string | null,
) =>
  request(
    apiKey,
    `/phone-number/${encodeURIComponent(id)}`,
    "PATCH",
    phoneSchema,
    { assistantId },
  );
export const deletePhoneNumber = (apiKey: string, id: string) =>
  remove(apiKey, `/phone-number/${encodeURIComponent(id)}`);
