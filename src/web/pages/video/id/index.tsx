import { RequestInfo } from "rwsdk/worker";
import { db } from "../../../../db";
import { VideoPlayer } from "../../../components/player";
import { ShareDialog } from "../../../components/share-dialog";
import { EditDialog } from "../../../components/edit-dialog";
import { DeleteDialog } from "../../../components/delete-dialog";
import { cn } from "../../../lib/utils";
import { env } from "cloudflare:workers";

export async function VideoPage({ ctx, params }: RequestInfo) {
  const { id } = params;

  const user = ctx.user;

  const video = await db.video.findUnique({
    where: {
      id,
    },
  });
  if (!video?.playlistUrl) {
    return <div>Video not found</div>;
  }

  const isVertical = !!(
    video.width &&
    video.height &&
    video.width < video.height
  );

  return (
    <>
      <title>{`${video.title} - StreamGeek`}</title>
      <meta name="description" content={video.description ?? ""} />
      <div className="flex flex-col gap-4 min-h-0 max-h-screen">
        {video.playlistUrl && (
          <div
            className={cn(
              "w-full max-h-[80vh]",
              !isVertical
                ? "aspect-16/9"
                : "aspect-9/16 sm:max-w-[50vw] mx-auto"
            )}
          >
            <VideoPlayer video={video} className="w-full h-full" />
          </div>
        )}
        <div className={cn("w-full", isVertical && "sm:max-w-[50vw] mx-auto")}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex items-center gap-2 sm:gap-2">
              <ShareDialog
                videoId={video.id}
                videoTitle={video.title}
                playlistUrl={video.playlistUrl}
                baseUrl={env.BASE_URL}
                isVertical={isVertical}
              />
              {user && (
                <>
                  <EditDialog
                    videoId={video.id}
                    videoTitle={video.title}
                    videoDescription={video.description || undefined}
                  />

                  <DeleteDialog videoId={video.id} videoTitle={video.title} />
                </>
              )}
            </div>
          </div>
          {video.description && (
            <p className="text-sm text-gray-500 mt-1">{video.description}</p>
          )}
        </div>
      </div>
    </>
  );
}
