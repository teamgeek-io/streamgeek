import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { UploadEditor } from "./UploadEditor";

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

  const existingJob = await db.job.findFirst({
    where: {
      videoId: id,
      status: "queued",
    },
  });

  return <UploadEditor video={video} existingJob={existingJob} />;
}
