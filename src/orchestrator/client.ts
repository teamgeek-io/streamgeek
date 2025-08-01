import { hc } from "hono/client";
import type { OrchestratorApp } from "./server";
import ky from "ky";

/**
 * Type-safe client for the shop API using Hono's RPC client
 *
 * @see https://github.com/orgs/honojs/discussions/3222 for more
 *
 */
const createOrchestratorClient = (url: string) =>
  hc<OrchestratorApp>(url, {
    fetch: ky.create(),
  });

export default createOrchestratorClient;
