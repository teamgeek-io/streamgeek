import { Hono } from "hono";

// Create Hono app with base path
const apiServer = new Hono().basePath("/api").get("/", (c) => {
  return c.json({
    message: "Hello!",
  });
});

export type Api = typeof apiServer;
export default apiServer;
