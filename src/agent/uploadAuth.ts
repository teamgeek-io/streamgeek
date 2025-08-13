import { Context, Next } from "hono";
import { validateUploadToken } from "./tokenUtils";

/**
 * Upload token authentication middleware
 * Validates bearer tokens for upload endpoint access
 */
export const uploadTokenAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Authorization header required" }, 401);
  }

  if (!authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Bearer token required" }, 401);
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  const validation = validateUploadToken(token);

  if (!validation.valid) {
    return c.json(
      {
        error: "Invalid upload token",
        details: validation.error,
      },
      401
    );
  }

  await next();
};
