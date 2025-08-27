import { route } from "rwsdk/router";
import { Login } from "./Login";
import { Register } from "./Register";
import { AppContext } from "../../../worker";

export const userRoutes = [
  // async ({ ctx }: { ctx: AppContext }) => {
  //   if (ctx.user) {
  //     console.log("user", ctx.user);
  //     return new Response(null, {
  //       status: 302,
  //       headers: { Location: "/upload" },
  //     });
  //   }
  // },
  route("/login", [Login]),
  route("/register", [Register]),
];
