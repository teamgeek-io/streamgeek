import { route } from "rwsdk/router";
import { CreateUpload } from ".";
import { UploadEditor } from "./id/editor";
import { UploadEditorPage } from "./id";

export const uploadRoutes = [
  route("/", [CreateUpload]),
  route("/:id", [UploadEditorPage]),
];
