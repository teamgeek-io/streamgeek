import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { VideoPlayer } from "./video-player";

export async function VideoPage({ ctx, params }: RequestInfo) {
  const { id } = params;

  const video = await db.video.findUnique({
    where: {
      id,
    },
  });
  if (!video) {
    return <div>Video not found</div>;
  }

  return (
    <div>
      {" "}
      {video.title}
      {video.playlistUrl && (
        <VideoPlayer video={video} className="w-full h-[80dvh]" />
      )}
    </div>
  );
}
