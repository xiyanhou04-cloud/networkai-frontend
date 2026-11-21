import OpenAI from "openai";
import { ApiError, searchPosts } from "@/lib/api";
import type { AgentInput } from "@/lib/content-agent";
import { runContentAgent } from "@/lib/server/content-agent";

const MAX_INPUT_LENGTH = 5_000;

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) {
    return Response.json({ error: "Sign in to use the agent." }, { status: 401 });
  }

  const data: Partial<Record<keyof AgentInput, unknown>> | null =
    await request.json().catch(() => null);
  const { interests = "", goal } = data ?? {};
  if (typeof interests !== "string" || typeof goal !== "string" || !goal.trim()) {
    return Response.json({ error: "Enter a valid goal and interests." }, { status: 400 });
  }
  if (interests.length + goal.length > MAX_INPUT_LENGTH) {
    return Response.json({ error: "Keep your goal and interests within 5,000 characters." }, {
      status: 400,
    });
  }

  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(65_000)]);
  try {
    // The Go search endpoint verifies the JWT before any paid model call.
    const session = await searchPosts(token, {}, signal);
    if (!Array.isArray(session)) throw new Error("Invalid search response.");

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_AGENT_MODEL;
    if (!apiKey || !model) {
      return Response.json({ error: "Configure server AI settings." }, { status: 503 });
    }

    const client = new OpenAI({ apiKey, maxRetries: 0 });
    const result = await runContentAgent(
      client,
      model,
      { interests: interests.trim(), goal: goal.trim() },
      token,
      signal,
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return Response.json({ error: "Session expired. Sign in again." }, { status: 401 });
    }
    return Response.json({ error: "The agent could not finish. Try again." }, { status: 502 });
  }
}
