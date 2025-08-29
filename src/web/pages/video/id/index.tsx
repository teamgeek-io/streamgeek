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
              video.width && video.height
                ? video.width > video.height
                  ? "aspect-16/9 max-h-[75dvh]"
                  : //wip
                    "aspect-9/16 max-h-full max-w-[50%]"
                : "aspect-16/9 max-h-[75dvh]"
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
