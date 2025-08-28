"use client";

import { useState, useTransition } from "react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { createVideo } from "../../shared/functions";
import { link } from "../../shared/links";

export function CreateUpload() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [title, setTitle] = useState("");

  const handleCreateVideo = () => {
    setError(null); // Clear previous errors

    startTransition(async () => {
      try {
        const result = await createVideo(title);
        if (result.success) {
          // RedwoodSDK doesn't have a client router/support for redirects on form actions, so this works fine 🤓
          // See https://github.com/redwoodjs/sdk/issues/472
          window.location.href = link("/upload/:id", { id: result.video!.id });
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err as Error);
      }
    });
  };

  return (
    <>
      <title>Upload - StreamGeek</title>
      <meta name="description" content="Upload a video to StreamGeek" />
      <div className="flex flex-col gap-4 max-w-md mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Create New Video
            </CardTitle>
            <CardDescription>
              Start by giving your video a title
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateVideo();
              }}
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Video Title
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your video"
                  required
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Creating..." : "Create Video"}
              </Button>

              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  Error: {error.message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
