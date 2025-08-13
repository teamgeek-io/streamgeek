import { Context, Next } from "hono";

/**
 * API Key authentication middleware
 */
export const apiKeyAuth = async (
  c: Context,
  next: Next,
  expectedApiKey: string
) => {
  const apiKey = c.req.header("X-API-Key");

  if (!expectedApiKey) {
    console.warn("ORCHESTRATOR_API_KEY not configured");
    return c.json({ error: "Server configuration error" }, 500);
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
