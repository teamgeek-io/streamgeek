import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";

import fs from "fs/promises";
import { FileStore } from "@tus/file-store";
import { Server } from "@tus/server";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { processPresets } from "./transcoder";
import { EventEmitter } from "events";

const tusServer = new Server({
  path: "/upload",
  datastore: new FileStore({ directory: "./input" }),
});

const transcodingEvents = new EventEmitter();

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
      processPresets(inputPath, (message) => {
        transcodingEvents.emit(jobId, message);
      }).then(() => {
        // do R2 upload here
      });

      return c.json({
        success: true,
      });
    }
  )
  .get("/progress/:jobId", async (c) => {
    const { jobId } = c.req.param();
    return streamSSE(c, async (stream) => {
      // Send initial connection message
      stream.writeSSE({
        data: "Connected to transcoding progress stream",
        event: "connected",
        id: jobId,
      });

      // Set up event listener for transcoding progress
      const progressHandler = (message: string) => {
        stream.writeSSE({
          data: message,
          event: "progress",
          id: jobId,
        });
      };

      transcodingEvents.on(jobId, progressHandler);

      // Send keep-alive heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        stream.writeSSE({
          data: "heartbeat",
          event: "heartbeat",
          id: jobId,
        });
      }, 30000);

      // Handle client disconnect
      stream.onAbort(() => {
        console.log(`Client disconnected from job ${jobId}`);
        transcodingEvents.off(jobId, progressHandler);
        clearInterval(heartbeatInterval);
      });

      // Keep stream alive using stream.sleep() in a loop
      try {
        while (true) {
          await stream.sleep(1000); // Sleep for 1 second
        }
      } catch (error) {
        // Stream was closed/aborted
        console.log(`Stream closed for job ${jobId}`);
        transcodingEvents.off(jobId, progressHandler);
        clearInterval(heartbeatInterval);
      }
    });
  })
  .all("/upload*", (c) => {
    return tusServer.handleWeb(c.req.raw);
  });

export type AgentApp = typeof agentApp;

export default agentApp;
