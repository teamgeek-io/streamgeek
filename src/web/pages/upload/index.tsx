"use client";

import { useState, useTransition } from "react";

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

  // ToDo: need auth!
  return (
    <div>
      <h1>Create a video</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateVideo();
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your video"
        />

        {error && <p>Error: {error.message}</p>}
        <button disabled={isPending}>
          {isPending ? "Creating..." : "Create video"}
        </button>
      </form>
    </div>
  );
}
