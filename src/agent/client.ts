import { hc } from "hono/client";
import type { AgentApp } from "./server";
import ky from "ky";

/**
 * Type-safe client for the agent API using Hono's RPC client
 *
 * @see https://github.com/orgs/honojs/discussions/3222 for more
 *
 */
const createAgentClient = (url: string, apiKey: string) =>
  hc<AgentApp>(url, {
    fetch: ky.create({
      headers: {
        "X-API-Key": apiKey,
      },
      timeout: 3000,
      retry: 1,
    }),
  });

export default createAgentClient;
