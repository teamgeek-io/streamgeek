import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { route } from "rwsdk/router";
import { RequestInfo } from "rwsdk/worker";
import { z } from "zod";
import { db } from "../../db";
import { PrismaClientKnownRequestError } from "../../../generated/prisma/internal/prismaNamespace";

/**
 * All of our orchestrator api endpoints live in this hono app.
 * These are endpoints that are called by the agents.
 *
 * We use hono here since it's got a nice api that's based on web standards
 * so its easy to convert to RedwoodSDK routes.
 *
 * @todo we should have a separate agent app for this, but easy enough to keep it in the same place.
 */
const orchestratorApp = new Hono()
  .basePath("/orchestrator")
  .get("/", (c) => {
    return c.text("Hello Orchestrator!");
  })
  // Agents
  .post(
    "/agent/register",
    zValidator("json", z.object({ url: z.url() })),
    async (c) => {
      const { url } = c.req.valid("json");

      const agent = await db.agent.create({
        data: {
          url,
          lastSeen: new Date(),
        },
      });

      return c.json({
        message: "Agent registered",
        agent,
      });
    }
  )
  .patch(
    "/agent/:id",
    zValidator("json", z.object({ url: z.url() })),
    async (c) => {
      const { id } = c.req.param();
      const { url } = c.req.valid("json");

      try {
        const agent = await db.agent.update({
          where: { id },
          data: {
            url,
            lastSeen: new Date(),
          },
        });

        return c.json({ message: "Agent updated", agent });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  // Jobs
  .post(
    "/job/create",
    zValidator(
      "json",
      z.object({
        videoId: z.string(),
      })
    ),
    (c) => {
      const { videoId } = c.req.valid("json");

      return c.text(`Hello Orchestrator! ${videoId}`);
    }
  );

async function orchestratorHandler({ request, params, ctx }: RequestInfo) {
  // ToDo: do we need params/ctx out of redwood?
  //   console.log(request, params, ctx);
  const url = new URL(request.url);

  const honoRequest = new Request(new URL(url.pathname, url.origin), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  const response = await orchestratorApp.request(honoRequest);
  return response;
}

export type OrchestratorApp = typeof orchestratorApp;
export default [route("*", orchestratorHandler)];
