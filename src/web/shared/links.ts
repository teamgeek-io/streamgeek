import { defineLinks } from "rwsdk/router";

export const link = defineLinks([
  "/",
  "/upload",
  "/upload/:id",
  "/user/login",
  "/user/register",
  "/video/:id",
]);
