import { Hono } from "hono";
import fs from "fs/promises";

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
  });

export type AgentApp = typeof agentApp;

export default agentApp;
