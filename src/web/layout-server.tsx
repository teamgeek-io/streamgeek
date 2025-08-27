import { LayoutProps } from "rwsdk/router";
import { AppLayoutClient } from "./layout-client";
import { auth } from "./lib/auth";

export async function AppLayoutServer({
  children,
  requestInfo,
  ...props
}: LayoutProps) {
  return (
    <AppLayoutClient session={requestInfo?.ctx.session}>
      {children}
    </AppLayoutClient>
  );
}
