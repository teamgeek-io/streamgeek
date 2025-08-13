"use client";

import { useState, useTransition } from "react";

import { startJob } from "../../../shared/functions";
import { Agent, Job, Video } from "../../../../db";
import { Uploader, UploadResult } from "./uploader";
import { TranscodeStatus } from "./transcode-status";

export function UploadEditor({
  videoId,
  videoTitle,
  job,
  token,
}: {
  videoId: string;
  videoTitle: string;
  job: (Job & { agent: Agent }) | null;
  token?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleUploadComplete = async (result: UploadResult) => {
    if (result.error || !result.uploadUrl) {
      console.error(result.error);
      setError(result.error || "Unknown error");
      return;
    }

    setUploadResult(result);

    const startJobActionRes = await startJob({
      jobId: job!.id,
      sourceFileId: result.uploadUrl.split("/").pop()!,
    });

    if (!startJobActionRes.success) {
      setError(startJobActionRes.error?.message || "Unknown error");
    }
  };

  return (
    <div>
      <h1>My video: {videoTitle}</h1>

      {error && <p>Error: {error}</p>}

      {job ? (
        <div>
          {uploadResult || job.status === "encoding" ? (
            <>
              <p>
                Upload complete, you can now close this tab. Encoding in
                progress...
              </p>
              {token && (
                <TranscodeStatus
                  url={job.agent.url}
                  jobId={job.id}
                  videoId={videoId}
                  token={token}
                />
              )}
            </>
          ) : (
            <>
              <p>
                Job:
                {job.id} on {job.agentId}
              </p>

              {token ? (
                <Uploader
                  endpoint={`${job.agent.url}/upload`}
                  onUploadComplete={(result) =>
                    startTransition(() => handleUploadComplete(result))
                  }
                  token={token}
                  onUploadStart={() => {
                    // ToDo: add a "transferring" state since we use "uploading" state for when agent uploads to R2
                  }}
                />
              ) : (
                <div>
                  Failed to generate upload token. Please refresh the page and
                  try again.
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div>Cant create a job</div>
      )}
    </div>
  );
}
