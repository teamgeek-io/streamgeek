import { hc } from "hono/client";
import type { AgentApp } from "./server";
import ky from "ky";

/**
 * Type-safe client for the shop API using Hono's RPC client
 *
 * @see https://github.com/orgs/honojs/discussions/3222 for more
 *
 */
const createAgentClient = (url: string) =>
  hc<AgentApp>(url, {
    fetch: ky.create(),
  });

export default createAgentClient;
