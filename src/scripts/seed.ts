import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";
import { env } from "cloudflare:workers";

export default defineScript(async () => {
  await setupDb(env);

  console.error("NOT IMPLEMENTED");

  // await db.$executeRawUnsafe(`\
  //   DELETE FROM User;
  //   DELETE FROM sqlite_sequence;
  // `);

  // await db.user.create({
  //   data: {
  //     id: "1",
  //     username: "testuser",
  //   },
  // });
});
