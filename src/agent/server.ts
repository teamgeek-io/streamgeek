import { Hono } from "hono";
import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import fs from "fs/promises";

const tusServer = new Server({
  path: "/uploads",
  datastore: new FileStore({ directory: "./uploads" }),
});

const agentApp = new Hono()
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
  .use("/upload", (c) => tusServer.handle(c.req.raw, c.res.raw));

export type AgentApp = typeof agentApp;

export default agentApp;
