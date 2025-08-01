"use server";

import { requestInfo } from "rwsdk/worker";
import { Agent, db, Video } from "../../db";
import { generateId } from "../utils/id";
import createAgentClient from "../../agent/client";

/**
 * @module
 *
 * All of our orchestrator server functions live here.
 *
 * These dont need to be endpoints since they are called directly from this app.
 *
 */

export const createVideo = async (title: string) => {
  try {
    const { ctx } = requestInfo;

    console.log(ctx);

    // Generate nanoid for the video
    const videoId = generateId();

    const video = await db.video.create({
      data: {
        id: videoId,
        title,
      },
    });

    return { success: true, video, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: error as Error };
  }
};

export const createJob = async (videoId: string) => {
  // ToDo: get the user id from the ctx and protect the endpoint
  const { ctx } = requestInfo;
  console.log(ctx);

  const agent = await getAgent();

  if (!agent) {
    return { success: false, job: null, error: "No agent available" };
  }

  // kill any existing jobs for this video
  await db.job.updateMany({
    where: {
      videoId,
    },
    data: {
      status: "failed",
    },
  });

  const job = await db.job.create({
    data: {
      agentId: agent.id,
      videoId,
      status: "queued",
    },
  });

  return { success: true, job: { ...job, agent }, error: null };
};

/**
 * @returns Agent that is available to take a job
 */
const getAgent = async () => {
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
    const agentClient = createAgentClient(agent.url);
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
