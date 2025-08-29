import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { VideoPlayer } from "../../../components/player";
import { cn } from "../../../lib/utils";

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

  const isVertical = video.width && video.height && video.width < video.height;

  return (
    <>
      <title>{`${video.title} - StreamGeek`}</title>
      <meta name="description" content={video.description ?? ""} />
      <div className="flex flex-col gap-4">
        {video.playlistUrl && (
          <VideoPlayer
            video={video}
            className={cn(
              "w-full ",
              !isVertical
                ? "aspect-16/9 max-h-[75dvh]"
                : "aspect-9/16 max-h-full max-w-[50dvw]"
            )}
          />
        )}
        <h1 className="text-2xl font-bold">{video.title}</h1>
        {video.description && (
          <p className="text-sm text-gray-500">{video.description}</p>
        )}
      </div>
    </>
  );
}
