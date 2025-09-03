"use client";

import { useState, useTransition } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
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
    <div className="flex flex-col gap-4 max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Video</CardTitle>
          <CardDescription>
            Drop a file for <span className="font-bold">{videoTitle}</span>{" "}
            below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
              Error: {error}
            </div>
          )}

          {job ? (
            <div className="space-y-4">
              {uploadResult ||
              job.status === "encoding" ||
              job.status === "uploading" ? (
                <TranscodeStatus
                  url={job.agent.url}
                  jobId={job.id}
                  videoId={videoId}
                  token={token!}
                />
              ) : (
                <div className="space-y-4">
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
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-red-700">
                        Failed to generate upload token. Please refresh the page
                        and try again.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-red-700">
                Unable to create a job. Please try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {job && (
        <div className="text-center text-xs text-gray-400 space-x-4 flex justify-between flex-col sm:flex-row">
          <span>Job ID: {job.id}</span>
          <span>Agent: {job.agent.url}</span>
        </div>
      )}
    </div>
  );
}
