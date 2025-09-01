import { route } from "rwsdk/router";
import { Login } from "./Login";
import { Register } from "./Register";
import { AppContext } from "../../../worker";

const redirectExistingUser = async ({ ctx }: { ctx: AppContext }) => {
  if (ctx.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/upload" },
    });
  }
};

export const userRoutes = [
  route("/login", [redirectExistingUser, Login]),
  route("/register", [redirectExistingUser, Register]),
];
