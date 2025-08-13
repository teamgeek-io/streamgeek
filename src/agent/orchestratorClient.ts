import createOrchestratorClient from "../orchestrator/client";

/**
 * Orchestrator singleton client with auth headers set for the agent
 */
export const orchestratorClient = createOrchestratorClient(
  process.env.ORCHESTRATOR_URL!,
  process.env.ORCHESTRATOR_API_KEY!
);
