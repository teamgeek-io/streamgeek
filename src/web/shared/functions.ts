"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "../../db";
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

export const startJob = async ({
  jobId,
  sourceFileId,
}: {
  jobId: string;
  sourceFileId: string;
}) => {
  try {
    const job = await db.job.update({
      where: { id: jobId },
      data: { status: "encoding", sourceFileId },
      include: {
        agent: true,
      },
    });

    const agentClient = createAgentClient(job.agent.url);
    await agentClient.start[":jobId"].$post({
      param: { jobId },
      json: {
        sourceFileId,
      },
    });

    return { success: true, job, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: error as Error };
  }
};
