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
  return <UploadEditor video={video} />;
}
