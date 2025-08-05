import { route } from "rwsdk/router";
import { VideoPage } from "./id";

export const videoRoutes = [route("/:id", [VideoPage])];
