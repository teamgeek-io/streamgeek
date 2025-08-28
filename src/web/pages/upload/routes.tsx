import { route } from "rwsdk/router";
import { CreateUpload } from ".";

import { UploadEditorPage } from "./id";
import { db } from "../../../db";
import { link } from "../../shared/links";
import { AppContext } from "../../../worker";

const requireAuth = async ({ ctx }: { ctx: AppContext }) => {
  if (!ctx.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: link("/user/login") },
    });
  }
};

export const uploadRoutes = [
  route("/", [requireAuth, CreateUpload]),
  route("/:id", [
    requireAuth,
    async ({ params }) => {
      const { id } = params;

      const doneJob = await db.job.findFirst({
        where: {
          videoId: id,
          status: {
            in: ["done"],
          },
        },
      });

      // Redirect early if there's already a video that's uploaded
      if (doneJob) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: link("/video/:id", { id: doneJob.videoId }),
          },
        });
      }

      return <UploadEditorPage params={params} />;
    },
  ]),
];
