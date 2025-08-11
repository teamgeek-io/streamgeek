"use client";

import {
  UppyContextProvider,
  UppyContext,
  DragDrop,
  ProgressBar,
  FileInput,
} from "@uppy/react";
import Uppy, { Body, Meta } from "@uppy/core";
import Tus from "@uppy/tus";

import "@uppy/core/dist/style.min.css";
import "@uppy/drag-drop/dist/style.min.css";
import "@uppy/file-input/dist/style.min.css";
import "@uppy/progress-bar/dist/style.min.css";

import { useState, useEffect } from "react";
import { UppyOptionsWithOptionalRestrictions } from "@uppy/core/lib/Uppy";

export interface UploadResult {
  success: boolean;
  uploadUrl?: string;
  error?: string;
}

interface UploaderProps {
  endpoint: string;
  onUploadComplete?: (result: UploadResult) => void;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onUploadStart?: () => void;
}

interface ProgressDetails {
  fileName: string;
  uploadedMB: number;
  totalMB: number;
  percentage: number;
}

function createUppy(
  endpoint: string,
  onComplete?: (result: UploadResult) => void
) {
  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB default
    },
    debug: true,
  }).use(Tus, {
    // Was having weird issue with this lib downgrading http on https,
    // somehow adding a trailing slash fixed it
    endpoint: `${endpoint}/`,
    headers: { "x-forwarded-proto": "https" },
  });

  uppy.on("complete", (result) => {
    const successful = Boolean(
      result.successful && result.successful.length > 0
    );

    const uploadUrl = successful && result.successful?.[0]?.response?.uploadURL;

    onComplete?.({
      success: successful,
      uploadUrl: uploadUrl || undefined,
      error: successful ? undefined : "Upload failed",
    });
  });

  uppy.on("upload-error", (file, error) => {
    onComplete?.({
      success: false,
      error: error.message || "Upload failed",
    });
  });

  return uppy;
}

export function Uploader({
  endpoint,
  onUploadComplete,
  onUploadStart,
}: UploaderProps) {
  const [uppy] = useState(() => createUppy(endpoint, onUploadComplete));
  const [fileAdded, setFileAdded] = useState(false);
  const [progressDetails, setProgressDetails] =
    useState<ProgressDetails | null>(null);

  useEffect(() => {
    const handleFileAdded = () => {
      if (uppy.getFiles().length > 0) {
        setFileAdded(true);
        onUploadStart?.();
        console.log(uppy.getState());
        uppy.upload();
      }
    };

    const handleProgress = (file: any, progress: any) => {
      // Handle the case where file is just a number (percentage) and progress is undefined
      if (typeof file === "number" && !progress) {
        return;
      }

      const fileData = uppy.getFile(file.id);

      if (fileData && progress) {
        const uploadedBytes = progress.bytesUploaded;
        const totalBytes = progress.bytesTotal;
        const percentage = (uploadedBytes / totalBytes) * 100;

        const details = {
          fileName: fileData.name || "Unknown file",
          uploadedMB: Math.round((uploadedBytes / (1024 * 1024)) * 100) / 100,
          totalMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
          percentage,
        };

        setProgressDetails(details);
      }
    };

    const handleUploadSuccess = () => {
      // Don't clear immediately, let the user see the final state
      setTimeout(() => {
        setProgressDetails(null);
      }, 2000); // Keep showing for 2 seconds after completion
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("upload-progress", handleProgress);
    uppy.on("upload-success", handleUploadSuccess);

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("upload-progress", handleProgress);
      uppy.off("upload-success", handleUploadSuccess);
    };
  }, [uppy]);

  return (
    <UppyContextProvider uppy={uppy}>
      <div className="uploader-container">
        {!fileAdded && (
          <DragDrop
            uppy={uppy}
            locale={{
              strings: {
                dropHereOr: "Drop file here or %{browse}",
                browse: "browse",
              },
            }}
          />
        )}
        {/* ToDo: custom progress bar */}
        <ProgressBar uppy={uppy} />

        {progressDetails && (
          <div
            className="upload-details"
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <div style={{ marginBottom: "5px" }}>
              <strong>File:</strong> {progressDetails.fileName}
            </div>
            <div>
              Keep this tab open!
              <strong>Progress:</strong> {progressDetails.uploadedMB} /{" "}
              {progressDetails.totalMB} MB (
              {progressDetails.percentage.toFixed(1)}%)
            </div>
          </div>
        )}
      </div>
    </UppyContextProvider>
  );
}
