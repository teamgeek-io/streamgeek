import { LayoutProps } from "rwsdk/router";

export function AppLayout({ children }: LayoutProps) {
  return (
    <div>
      <h1>StreamGeek</h1>
      {children}
    </div>
  );
}
