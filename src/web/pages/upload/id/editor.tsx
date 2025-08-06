"use client";

import { useEffect, useState, useTransition } from "react";

import { createJob, startJob } from "../../../shared/functions";
import { Agent, Job, Video } from "../../../../db";
import { Uploader, UploadResult } from "./uploader";
import { TranscodeStatus } from "./transcode-status";
import { link } from "../../../shared/links";

export function UploadEditor({
  video,
  existingJob,
}: {
  video: Video;
  existingJob: (Job & { agent: Agent }) | null;
}) {
  useEffect(() => {
    if (existingJob?.status === "done" && typeof window !== "undefined") {
      // We do this here because redirecting in the route handler seems to cause redwood dev server to break :(
      window.location.href = link("/video/:id", { id: video.id });
    }
  }, [existingJob]);

  console.log("video", video);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [job, setJob] = useState(existingJob);

  const handleCreateJob = async () => {
    setError(null);
    const result = await createJob(video.id);

    if (result.success) {
      setJob(result.job);
    } else {
      setError(result.error as string);
      setJob(null);
    }
  };

  const handleUploadComplete = async (result: UploadResult) => {
    setUploadResult(result);

    await startJob({
      jobId: job!.id,
      sourceFileId: result.uploadUrl!.split("/").pop()!,
    });
  };

  // ToDo: need auth!
  return (
    <div>
      <h1>My video: {video.title}</h1>

      {error && <p>Error: {error}</p>}
      {job ? (
        <div>
          {uploadResult || job.status === "encoding" ? (
            <>
              <p>Upload complete, encoding in progress...</p>
              <TranscodeStatus
                url={job.agent.url}
                jobId={job.id}
                videoId={video.id}
              />
            </>
          ) : (
            <>
              <p>
                Job:
                {job.id} on {job.agentId}
              </p>
              <Uploader
                endpoint={`${job.agent.url}/upload`}
                onUploadComplete={(result) =>
                  startTransition(() => handleUploadComplete(result))
                }
              />
            </>
          )}
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
