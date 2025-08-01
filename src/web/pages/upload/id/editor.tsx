"use client";

import { useState, useTransition } from "react";

import { RequestInfo } from "rwsdk/worker";
import { createJob } from "../../../shared/functions";
import { Agent, Job, Video } from "../../../../db";
import { Uploader } from "./uploader";

export function UploadEditor({
  video,
  existingJob,
}: {
  video: Video;
  existingJob: (Job & { agent: Agent }) | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState(existingJob);

  const handleCreateJob = async () => {
    const result = await createJob(video.id);

    if (result.success) {
      setJob(result.job);
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
        <div>
          <p>
            Job ready: {job.id} on {job.agentId}
          </p>
          <Uploader endpoint={`${job.agent.url}/upload`} />
        </div>
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
