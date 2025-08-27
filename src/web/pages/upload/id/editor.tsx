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
            Upload your video file to start processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Video Title:</span>
            <span className="text-sm text-gray-600">{videoTitle}</span>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
              Error: {error}
            </div>
          )}

          {job ? (
            <div className="space-y-4">
              {uploadResult || job.status === "encoding" ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">
                      Upload complete! You can now close this tab.
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Encoding in progress...
                    </p>
                  </div>

                  {token && (
                    <TranscodeStatus
                      url={job.agent.url}
                      jobId={job.id}
                      videoId={videoId}
                      token={token}
                    />
                  )}
                </div>
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
        <div className="text-center text-xs text-gray-400 space-x-4">
          <span>Job ID: {job.id}</span>
          <span>Agent: {job.agentId}</span>
        </div>
      )}
    </div>
  );
}
