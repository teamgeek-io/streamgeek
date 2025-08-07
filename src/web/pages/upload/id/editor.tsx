"use client";

import { useState, useTransition } from "react";

import { createJob, startJob } from "../../../shared/functions";
import { Agent, Job, Video } from "../../../../db";
import { Uploader, UploadResult } from "./uploader";
import { TranscodeStatus } from "./transcode-status";

export function UploadEditor({
  videoId,
  videoTitle,
  existingJob,
}: {
  videoId: string;
  videoTitle: string;
  existingJob: (Job & { agent: Agent }) | null;
}) {
  console.log("existingJob", existingJob);
  // useEffect(() => {
  //   if (existingJob?.status === "done" && typeof window !== "undefined") {
  //     // We do this here because redirecting in the route handler seems to cause redwood dev server to break :(
  //     window.location.href = link("/video/:id", { id: video.id });
  //   }
  // }, [existingJob]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [job, setJob] = useState(existingJob);

  const handleCreateJob = async () => {
    setError(null);
    const result = await createJob(videoId);

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
      <h1>My video: {videoTitle}</h1>

      {error && <p>Error: {error}</p>}
      {job ? (
        <div>
          {uploadResult || job.status === "encoding" ? (
            <>
              <p>Upload complete, encoding in progress...</p>
              <TranscodeStatus
                url={job.agent.url}
                jobId={job.id}
                videoId={videoId}
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
