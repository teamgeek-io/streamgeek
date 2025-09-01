import { route } from "rwsdk/router";
import { Login } from "./login";
import RegisterPage from "./register";
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
  route("/register", [redirectExistingUser, RegisterPage]),
];
