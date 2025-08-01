import { LayoutProps } from "rwsdk/router";

export function AppLayout({ children, ctx }: LayoutProps) {
  return (
    <div>
      <h1>StreamGeek</h1>
      {children}
    </div>
  );
}
