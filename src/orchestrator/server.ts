import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { route } from "rwsdk/router";
import { RequestInfo } from "rwsdk/worker";
import { z } from "zod";
import { db } from "../db";
import { JobStatus } from "../../generated/prisma/enums";
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace";

/**
 * All of our orchestrator api endpoints live in this hono app.
 * These are endpoints that are called by the agents.
 *
 * We use hono here since it's got a nice api that's based on web standards
 * so its easy to convert to RedwoodSDK routes.
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
          return c.json(
            { success: false, agent: null, error: error.message },
            400
          );
        }
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  // Jobs
  .patch(
    "/job/:jobId",
    zValidator("json", z.object({ status: z.enum(JobStatus) })),
    async (c) => {
      const { jobId } = c.req.param();
      const { status } = c.req.valid("json");
      const job = await db.job.update({
        where: { id: jobId },
        data: { status: status },
      });
      return c.json({ job });
    }
  )
  .get("/job/:jobId", async (c) => {
    const { jobId } = c.req.param();
    const job = await db.job.findUnique({
      where: { id: jobId },
    });
    return c.json({ job });
  })
  // Videos
  .patch(
    "/video/:videoId",
    zValidator(
      "json",
      z.object({
        thumbnailUrl: z.string().optional(),
        playlistUrl: z.string().optional(),
      })
    ),
    async (c) => {
      const { videoId } = c.req.param();
      const { thumbnailUrl, playlistUrl } = c.req.valid("json");
      const video = await db.video.update({
        where: { id: videoId },
        data: { thumbnailUrl, playlistUrl },
      });
      return c.json({ video });
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
