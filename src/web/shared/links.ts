import { defineLinks } from "rwsdk/router";

export const link = defineLinks([
  "/",
  "/upload",
  "/upload/:id",
  "/user/login",
  "/user/logout",
  "/video/:id",
]);
