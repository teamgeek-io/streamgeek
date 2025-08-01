import { Hono } from "hono";

const agentApp = new Hono().get("/", (c) => {
  return c.text("Hello Agent!");
});

export type AgentApp = typeof agentApp;

export default agentApp;
