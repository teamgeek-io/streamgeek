import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";

import createAgentClient from "../../../../agent/client";
import { UploadEditor } from "./editor";

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

  let existingJob = await db.job.findFirst({
    where: {
      videoId: id,
      status: {
        in: ["queued", "encoding", "done"],
      },
    },
    include: {
      agent: true,
    },
  });

  if (existingJob) {
    const agentClient = createAgentClient(existingJob.agent.url);
    try {
      await agentClient.ping.$get();
    } catch (error) {
      console.error("Agent not responding", error);
      await db.job.update({
        where: { id: existingJob.id },
        data: { status: "failed" },
      });
      existingJob = null;
    }
  }

  return (
    <UploadEditor
      videoId={video.id}
      videoTitle={video.title}
      existingJob={existingJob}
    />
  );
}
