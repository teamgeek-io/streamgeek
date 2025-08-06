import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { UploadEditor } from "./editor";
import createAgentClient from "../../../../agent/client";

export async function UploadEditorPage({ ctx, params }: RequestInfo) {
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

  return <UploadEditor video={video} existingJob={existingJob} />;
}
