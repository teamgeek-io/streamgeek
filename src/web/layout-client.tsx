"use client";

import { ThemeProvider } from "@/web/components/theme-provider";
import { ModeToggle } from "@/web/components/mode-toggle";
import { Button } from "@/web/components/ui/button";
import { authClient } from "@/web/lib/auth-client";
import { Video, LogIn, LogOut, HardDriveUpload } from "lucide-react";
import { Session } from "better-auth";
import { link } from "./shared/links";

export function AppLayoutClient({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/user/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleLogin = () => {
    window.location.href = "/user/login";
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <div className=" mx-8 sm:mx-24 my-8 flex flex-col gap-8 2xl:mx-48">
        <div className="flex justify-between items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Video className="h-6 w-6" />
            <h1 className="text-xl sm:block hidden font-semibold">
              StreamGeek
            </h1>
            <h1 className="text-xl sm:hidden font-semibold">STRMGK</h1>
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            {session && (
              <Button variant="outline" asChild size="icon">
                <a href={link("/upload")}>
                  <HardDriveUpload className="h-4 w-4" />
                </a>
              </Button>
            )}

            <ModeToggle />
            <Button
              size="icon"
              variant={session ? "outline" : "default"}
              onClick={session ? handleLogout : handleLogin}
            >
              {session ? (
                <>
                  <LogOut className="h-4 w-4" />
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </ThemeProvider>
  );
}
