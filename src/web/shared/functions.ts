"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "../../db";
import { generateId } from "../lib/id";
import createAgentClient from "../../agent/client";
import { env } from "cloudflare:workers";
import { deleteFolderFromS3 } from "../lib/s3";

/**
 * @module
 *
 * All of our orchestrator server functions live here.
 *
 * These dont need to be endpoints since they are called directly from react components.
 *
 */

export const createVideo = async (title: string) => {
  try {
    const { ctx } = requestInfo;

    if (!ctx.user) {
      return { success: false, error: new Error("User not authenticated") };
    }

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

export const updateVideo = async ({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) => {
  try {
    const { ctx } = requestInfo;

    if (!ctx.user) {
      return { success: false, error: new Error("User not authenticated") };
    }

    const video = await db.video.update({
      where: { id },
      data: {
        description,
        title,
      },
    });

    return { success: true, video, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: error as Error };
  }
};

export const deleteVideo = async ({ id }: { id: string }) => {
  try {
    const { ctx } = requestInfo;

    if (!ctx.user) {
      return { success: false, error: new Error("User not authenticated") };
    }

    await db.job.deleteMany({
      where: { videoId: id },
    });

    const video = await db.video.delete({
      where: { id },
    });

    if (video.playlistUrl) {
      await deleteFolderFromS3(video.id);
    }

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
    const { ctx } = requestInfo;

    if (!ctx.user) {
      return { success: false, error: new Error("User not authenticated") };
    }

    const job = await db.job.update({
      where: { id: jobId },
      data: { status: "encoding", sourceFileId },
      include: {
        agent: true,
      },
    });

    const agentClient = createAgentClient(job.agent.url, env.AGENTS_API_KEY);
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
