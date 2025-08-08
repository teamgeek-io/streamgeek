import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";

import createAgentClient from "../../../../agent/client";
import { UploadEditor } from "./editor";
import { getAgent } from "../../../utils/agent";
import { Suspense } from "react";

export async function UploadEditorPage({
  params,
}: Pick<RequestInfo, "params">) {
  const { id } = params;
  const video = await db.video.findUnique({
    where: {
      id,
    },
  });

  if (!video) {
    return <div>Video not found</div>;
  }

  let job = await db.job.findFirst({
    where: {
      videoId: id,
      status: {
        in: ["queued", "encoding"],
      },
    },
    include: {
      agent: true,
    },
  });

  if (job) {
    const agentClient = createAgentClient(job.agent.url);
    try {
      await agentClient.ping.$get();
    } catch (error) {
      console.error("Agent not responding", error);
      await db.job.update({
        where: { id: job.id },
        data: { status: "failed" },
      });
      job = null;
    }
  } else {
    const agent = await getAgent();

    if (!agent) {
      return (
        <div>
          No agent available, make sure at least one agent is running and is
          pointed to this app
        </div>
      );
    }

    // kill any existing jobs for this video
    await db.job.updateMany({
      where: {
        videoId: id,
      },
      data: {
        status: "failed",
      },
    });

    const newJob = await db.job.create({
      data: {
        agentId: agent.id,
        videoId: id,
        status: "queued",
      },
      include: {
        agent: true,
      },
    });

    job = newJob;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadEditor videoId={video.id} videoTitle={video.title} job={job} />
    </Suspense>
  );
}
