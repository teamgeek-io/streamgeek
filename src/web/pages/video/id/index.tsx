import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { VideoPlayer } from "../../../components/player";

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
    <div className="flex flex-col gap-4">
      {video.playlistUrl && (
        <VideoPlayer
          video={video}
          className="aspect-16/9 w-full max-h-[75dvh]"
        />
      )}
      <h1 className="text-2xl font-bold">{video.title}</h1>
      {video.description && (
        <p className="text-sm text-gray-500">{video.description}</p>
      )}
    </div>
  );
}
