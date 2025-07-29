"use client";

import { useState, useTransition } from "react";

import { RequestInfo } from "rwsdk/worker";
import { createJob } from "../../../orchestrator/functions";
import { Job, Video } from "../../../../db";

export function UploadEditor({ video }: { video: Video }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  const handleCreateJob = async () => {
    const result = await createJob();
    if (result.success) {
      setJob(result.job as Job);
    } else {
      setError(result.error);
      setJob(null);
    }
  };

  // ToDo: need auth!
  return (
    <div>
      <h1>My video: {video.title}</h1>
      {job && <p>Job created: {job.id}</p>}
      {error && <p>Error: {error.message}</p>}
      <button
        onClick={() => startTransition(() => handleCreateJob())}
        disabled={isPending}
      >
        Start a job
      </button>
    </div>
  );
}
