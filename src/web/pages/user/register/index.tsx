import { env } from "cloudflare:workers";
import { Register } from "./Register";

/**
 * RSC that wraps client register component with invite only flag
 */
export default function RegisterPage() {
  return <Register inviteOnly={env.INVITE_ONLY === "true"} />;
}
