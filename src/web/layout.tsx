"use client";

import { LayoutProps } from "rwsdk/router";
import { ThemeProvider } from "@/web/components/theme-provider";
import { ModeToggle } from "@/web/components/mode-toggle";

export function AppLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <div className=" mx-8 sm:mx-24 my-8 flex flex-col gap-8 2xl:mx-48">
        <div className="flex justify-between items-center gap-4">
          <a href="/">
            <h1 className="text-xl font-semibold">StreamGeek</h1>
          </a>
          <ModeToggle />
        </div>
        <div>{children}</div>
      </div>
    </ThemeProvider>
  );
}
