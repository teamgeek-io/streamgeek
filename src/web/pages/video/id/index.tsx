import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { VideoPlayer } from "../../../components/player";
import { ShareDialog } from "../../../components/share-dialog";
import { cn } from "../../../lib/utils";
import { env } from "cloudflare:workers";

export async function VideoPage({ ctx, params }: RequestInfo) {
  const { id } = params;

  const video = await db.video.findUnique({
    where: {
      id,
    },
  });
  if (!video?.playlistUrl) {
    return <div>Video not found</div>;
  }

  const isVertical = video.width && video.height && video.width < video.height;

  return (
    <>
      <title>{`${video.title} - StreamGeek`}</title>
      <meta name="description" content={video.description ?? ""} />
      <div className="flex flex-col gap-4 min-h-0">
        {video.playlistUrl && (
          <div
            className={cn(
              "w-full",
              !isVertical
                ? "aspect-16/9 max-h-[50vh]"
                : "aspect-9/16 max-h-[80vh] sm:max-w-[50vw] mx-auto"
            )}
          >
            <VideoPlayer video={video} className="w-full h-full" />
          </div>
        )}
        <div className={cn("w-full", isVertical && "sm:max-w-[50vw] mx-auto")}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <ShareDialog
              videoId={video.id}
              videoTitle={video.title}
              playlistUrl={video.playlistUrl}
              baseUrl={env.BASE_URL}
            />
          </div>
          {video.description && (
            <p className="text-sm text-gray-500">{video.description}</p>
          )}
        </div>
      </div>
    </>
  );
}
