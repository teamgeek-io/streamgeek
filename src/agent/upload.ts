import { FileStore } from "@tus/file-store";
import { Server } from "@tus/server";

const tusServer = new Server({
  path: "/upload",
  datastore: new FileStore({ directory: "./uploads" }),
});

export const tusMiddleware = async (c: any, next: any) => {
  //   const path = c.req.path;

  const req = c.req.raw;
  const res = c.res.raw;

  return tusServer.handle(req, res);

  //   // Continue to next middleware for non-TUS requests
  //   return next();
};
