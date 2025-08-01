import { Hono } from "hono";
import { cors } from "hono/cors";

import fs from "fs/promises";
import { FileStore } from "@tus/file-store";
import { Server } from "@tus/server";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { processPresets } from "./transcoder";

const tusServer = new Server({
  path: "/upload",
  datastore: new FileStore({ directory: "./input" }),
});

const agentApp = new Hono()
  .use("*", cors({ origin: process.env.ORCHESTRATOR_URL! })) // TODO: restrict to only the web app
  .get("/", (c) => {
    return c.text("Hello Agent!");
  })
  .get("/ping", async (c) => {
    const agentUrl = process.env.AGENT_URL;
    const agentId = await fs.readFile("agent_id.txt", "utf8");
    return c.json({
      agentId,
      agentUrl,
    });
  })
  .post(
    "/start/:jobId",
    zValidator("json", z.object({ sourceFileId: z.string() })),
    async (c) => {
      const { jobId } = c.req.param();
      const { sourceFileId } = c.req.valid("json");
      console.log("sourceFileId", sourceFileId);
      const inputPath = new URL(
        `file://${process.cwd()}/input/${sourceFileId}`
      );

      // We sneaky dont await here to avoid blocking the request
      // TODO: this could be in a worker
      processPresets(inputPath).then(() => {
        // do R2 upload here
      });

      return c.json({
        success: true,
      });
    }
  )
  .all("/upload*", (c) => {
    return tusServer.handleWeb(c.req.raw);
  });

export type AgentApp = typeof agentApp;

export default agentApp;
