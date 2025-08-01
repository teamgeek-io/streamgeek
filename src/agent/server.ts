import { Hono } from "hono";
import { cors } from "hono/cors";

import fs from "fs/promises";
import { FileStore } from "@tus/file-store";
import { Server } from "@tus/server";

const tusServer = new Server({
  path: "/upload",
  datastore: new FileStore({ directory: "./uploads" }),
});

const agentApp = new Hono()
  .use("*", cors()) // TODO: restrict to only the web app
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
  .all("/upload*", (c) => {
    return tusServer.handleWeb(c.req.raw);
  });

export type AgentApp = typeof agentApp;

export default agentApp;
