"use client";

import { useState, useTransition } from "react";

import { RequestInfo } from "rwsdk/worker";
import { createVideo } from "../../shared/functions";
import { link } from "../../shared/links";

export function CreateUpload({ ctx }: RequestInfo) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [title, setTitle] = useState("");

  const handleCreateVideo = async () => {
    const result = await createVideo(title);
    if (result.success) {
      // RedwoodSDK doesn't have a client router, so this works fine 🤓
      // See https://github.com/redwoodjs/sdk/issues/472
      window.location.href = link("/upload/:id", { id: result.video!.id });
    } else {
      setError(result.error);
    }
  };

  // ToDo: need auth!
  return (
    <div>
      <h1>Create a video</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for your video"
      />

      {error && <p>Error: {error.message}</p>}
      <button
        onClick={() => startTransition(() => handleCreateVideo())}
        disabled={isPending}
      >
        Create video
      </button>
    </div>
  );
}
