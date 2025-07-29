import { route } from "rwsdk/router";
import { CreateUpload } from "./CreateUpload";
import { UploadEditor } from "./id/UploadEditor";
import { UploadEditorPage } from "./id/UploadEditorPage";

export const uploadRoutes = [
  route("/", [CreateUpload]),
  route("/:id", [UploadEditorPage]),
];
