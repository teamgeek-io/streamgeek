"use client";

import { LayoutProps } from "rwsdk/router";
import { ThemeProvider } from "@/web/components/theme-provider";
import { ModeToggle } from "@/web/components/mode-toggle";

export function AppLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <h1>StreamGeek</h1>
      <ModeToggle />
      {children}
    </ThemeProvider>
  );
}
