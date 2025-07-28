import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";

dotenv.config();

// ToDo: figure out local dev, info: https://github.com/drizzle-team/drizzle-orm/discussions/1545
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  driver: "d1-http",
  dbCredentials: {
    // See: https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
