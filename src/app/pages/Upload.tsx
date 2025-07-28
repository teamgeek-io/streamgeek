import { RequestInfo } from "rwsdk/worker";

export function Upload({ ctx }: RequestInfo) {
  console.log(ctx);
  // ToDo: need auth!
  return <div>Upload</div>;
}
