/**
 * This is the entry point for the agent app.
 *
 * Note: although this shared the codebase, it's deployed
 * outside of cloudflare in its own node app.
 */

import { serve } from "@hono/node-server";
import agentApp from "./server";
import createOrchestratorClient from "../orchestrator/client";
import fs from "fs/promises";

const orchestratorClient = createOrchestratorClient(
  process.env.ORCHESTRATOR_URL!
);

const startServer = async () => {
  let agentId: string | null = null;

  try {
    agentId = await fs.readFile("agent_id.txt", "utf8");
  } catch (e) {
    // file doesn't exist, so we need to register the agent
  }

  if (!agentId) {
    const res = await orchestratorClient.orchestrator.agent.register.$post({
      json: {
        url: process.env.ORCHESTRATOR_URL!,
      },
    });

    const agent = (await res.json()).agent;

    await fs.writeFile("agent_id.txt", agent.id);
  }

  serve(
    {
      fetch: agentApp.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Agent app is running on http://localhost:${info.port}`);
    }
  );
};

startServer();
