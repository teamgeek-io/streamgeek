"use server";

import { requestInfo } from "rwsdk/worker";
import { db, Video } from "../../db";
import { generateId } from "../utils/id";

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

export const createJob = async () => {
  try {
    // ToDo: get the user id from the ctx and protect the endpoint
    const { ctx } = requestInfo;
    console.log(ctx);

    // if (!ctx.user) {
    //   throw new Error("User not found");
    // }

    return { success: true, job: "hii", error: null };
  } catch (error) {
    console.error(error);
    return { success: false, job: null, error: error as Error };
  }
};
