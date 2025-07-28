import apiServer from "@/api";
import { handle } from "hono/vercel";

export const GET = handle(apiServer);
export const POST = handle(apiServer);
export const PUT = handle(apiServer);
export const DELETE = handle(apiServer);
export const PATCH = handle(apiServer);
