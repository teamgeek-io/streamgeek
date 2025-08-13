import { hc } from "hono/client";
import type { OrchestratorApp } from "./server";
import ky from "ky";

/**
 * Type-safe client for the orchestrator API using Hono's RPC client
 *
 * @see https://github.com/orgs/honojs/discussions/3222 for more
 *
 */
const createOrchestratorClient = (url: string, apiKey: string) =>
  hc<OrchestratorApp>(url, {
    fetch: ky.create({
      headers: {
        "X-API-Key": apiKey,
      },
    }),
  });

export default createOrchestratorClient;
