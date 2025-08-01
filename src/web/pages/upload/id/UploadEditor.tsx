"use client";

import { useState, useTransition } from "react";

import { RequestInfo } from "rwsdk/worker";
import { createJob } from "../../../shared/functions";
import { Job, Video } from "../../../../db";

export function UploadEditor({
  video,
  existingJob,
}: {
  video: Video;
  existingJob: Job | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(existingJob);

  const handleCreateJob = async () => {
    const result = await createJob(video.id);

    if (result.success) {
      setJob(result.job as Job);
    } else {
      setError(result.error as string);
      setJob(null);
    }
  };

  // ToDo: need auth!
  return (
    <div>
      <h1>My video: {video.title}</h1>

      {error && <p>Error: {error}</p>}
      {job ? (
        <p>Job ready: {job.id}</p>
      ) : (
        <button
          onClick={() => startTransition(() => handleCreateJob())}
          disabled={isPending}
        >
          Start a job
        </button>
      )}
    </div>
  );
}
