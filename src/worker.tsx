import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix, layout } from "rwsdk/router";
import { Document } from "@/web/Document";
import { Home } from "@/web/pages/home";
import { setCommonHeaders } from "@/web/headers";
import { userRoutes } from "@/web/pages/user/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
import { AppLayout } from "./web/layout";
import { uploadRoutes } from "./web/pages/upload/routes";
import orchestratorApp from "./orchestrator/server";
import { videoRoutes } from "./web/pages/video/routes";
export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      ctx.session = await sessions.load(request);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers);
        headers.set("Location", "/user/login");

        return new Response(null, {
          status: 302,
          headers,
        });
      }

      throw error;
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
    }
  },
  render(Document, [
    prefix("/orchestrator", orchestratorApp),
    layout(AppLayout, [
      route("/protected", [
        ({ ctx }) => {
          if (!ctx.user) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/user/login" },
            });
          }
        },
        Home,
      ]),
      route("/", Home),
      prefix("/user", userRoutes),
      prefix("/upload", uploadRoutes),
      prefix("/video", videoRoutes),
    ]),
  ]),
]);
