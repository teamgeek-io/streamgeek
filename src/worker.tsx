import { defineApp } from "rwsdk/worker";
import { route, render, prefix, layout } from "rwsdk/router";
import { Document } from "@/web/Document";
import { Home } from "@/web/pages/home";
import { setCommonHeaders } from "@/web/headers";
import { userRoutes } from "@/web/pages/user/routes";

import { setupDb } from "@/db";
import { type Session, type User } from "better-auth";

import { env } from "cloudflare:workers";

import { uploadRoutes } from "./web/pages/upload/routes";
import orchestratorApp from "./orchestrator/server";
import { videoRoutes } from "./web/pages/video/routes";
import { createAuth } from "./web/lib/auth";
import { AppLayoutServer } from "./web/layout-server";
import { EmbedPage } from "./web/pages/embed";

export type AppContext = {
  session: Session | null;
  user: User | null;
  authUrl: string;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request }) => {
    await setupDb(env);

    const auth = await createAuth(env);

    ctx.authUrl = env.BASE_URL;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    ctx.session = session?.session || null;
    ctx.user = session?.user || null;
  },
  route("/api/auth/*", async ({ request }) => {
    const { createAuth } = await import("./web/lib/auth");
    const auth = await createAuth(env);
    return auth.handler(request);
  }),

  render(Document, [
    route("/embed/:id", EmbedPage),
    prefix("/orchestrator", orchestratorApp),
    layout(AppLayoutServer, [
      route("/", Home),
      prefix("/user", userRoutes),
      prefix("/upload", uploadRoutes),
      prefix("/video", videoRoutes),
    ]),
  ]),
]);
