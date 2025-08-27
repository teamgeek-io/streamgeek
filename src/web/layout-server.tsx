import { LayoutProps } from "rwsdk/router";
import { AppLayoutClient } from "./layout-client";

export async function AppLayoutServer({ children, requestInfo }: LayoutProps) {
  return (
    <AppLayoutClient session={requestInfo?.ctx.session}>
      {children}
    </AppLayoutClient>
  );
}
