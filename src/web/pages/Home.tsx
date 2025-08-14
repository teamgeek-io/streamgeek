import { RequestInfo } from "rwsdk/worker";
import { Button } from "../components/ui/button";

export function Home({ ctx }: RequestInfo) {
  return (
    <div>
      <p>
        {ctx.user?.username ? (
          <p>
            You are logged in as user {ctx.user.username}, upload a video{" "}
            <a href="/upload">here</a>!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p>You are not logged in.</p>
            <Button asChild>
              <a href="/user/login">Login</a>
            </Button>
          </div>
        )}
      </p>
    </div>
  );
}
