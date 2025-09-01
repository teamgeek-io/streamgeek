import { db } from "@/db";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Runtime function for creating auth with Cloudflare Workers context
export const createAuth = async (env: any) => {
  return betterAuth({
    database: prismaAdapter(db, {
      provider: "sqlite",
    }),
    appName: "StreamGeek",
    baseURL: env.BASE_URL || "http://localhost:5173",
    emailAndPassword: {
      enabled: true,
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") {
          return;
        }

        if (env.INVITE_ONLY === "true") {
          if (ctx.body?.inviteCode !== env.INVITE_CODE)
            throw new APIError("BAD_REQUEST", {
              message: "Invite code is invalid",
            });
        }
      }),
    },
  });
};

// CLI-compatible configuration that doesn't require runtime imports
// This will be used by Better Auth CLI for schema generation
const createAuthForCLI = async () => {
  // Use process.env for CLI context
  const env = process.env;

  return await createAuth(env);
};

// Export for CLI compatibility - Better Auth CLI will detect this
export const auth = await createAuthForCLI();
