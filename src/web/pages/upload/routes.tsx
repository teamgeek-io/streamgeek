import { route } from "rwsdk/router";
import { CreateUpload } from ".";
import { UploadEditor } from "./id/editor";
import { UploadEditorPage } from "./id";
import { db } from "../../../db";
import { link } from "../../shared/links";

export const uploadRoutes = [
  route("/", [CreateUpload]),
  route("/:id", [
    // async ({ params }) => {
    //   const { id } = params;

    //   const existingJob = await db.job.findFirst({
    //     where: {
    //       videoId: id,
    //       status: {
    //         in: ["done"],
    //       },
    //     },
    //   });

    //   if (existingJob) {
    //     return new Response(null, {
    //       status: 302,
    //       headers: {
    //         Location: link("/video/:id", { id: existingJob.videoId }),
    //       },
    //     });
    //   }
    // },
    UploadEditorPage,
  ]),
];
