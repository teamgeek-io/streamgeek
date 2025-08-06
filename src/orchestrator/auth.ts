import { env } from "cloudflare:workers";

/**
 * API Key authentication middleware
 */
export const apiKeyAuth = async (c: any, next: any) => {
  const apiKey = c.req.header("X-API-Key");
  const expectedApiKey = env.API_KEY;

  if (!expectedApiKey) {
    console.warn("ORCHESTRATOR_API_KEY not configured");
    return c.json({ error: "Server configuration error" }, 500);
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
