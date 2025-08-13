import { env } from "cloudflare:workers";
import { Agent } from "../../../generated/prisma";
import createAgentClient from "../../agent/client";
import { db } from "../../db";

/**
 * @returns Agent that is available to take a job
 */
export const getAgent = async () => {
  const agents = await db.agent.findMany({
    select: {
      id: true,
      url: true,
      lastSeen: true,
      createdAt: true,
      _count: {
        select: {
          jobs: {
            where: {
              status: {
                notIn: ["done", "failed"],
              },
            },
          },
        },
      },
    },
    orderBy: {
      jobs: {
        _count: "asc",
      },
    },
  });

  let okAgent: Agent | null = null;

  // Ping agents until one is available
  for (const agent of agents) {
    const agentClient = createAgentClient(agent.url, env.AGENTS_API_KEY);
    try {
      const pingResponse = await agentClient.ping.$get();

      if (pingResponse.ok) {
        okAgent = agent;
        break;
      }
    } catch (error) {
      console.error("Agent not responding", error);
      //ToDo: delete dead agent from db
    }
  }

  return okAgent;
};
