"use client";

import { UppyContextProvider, UppyContext, FileInput } from "@uppy/react";
import Uppy, { Body, Meta } from "@uppy/core";
import Tus from "@uppy/tus";

import "@uppy/core/dist/style.min.css";
import "@uppy/file-input/dist/style.min.css";

import { useState, useEffect } from "react";
import { UppyOptionsWithOptionalRestrictions } from "@uppy/core/lib/Uppy";
import { UppyFileDropZone } from "../../../components/ui/uppy-file-drop-zone";
import { UppyProgressBar } from "../../../components/ui/progress-bar";

export interface UploadResult {
  success: boolean;
  uploadUrl?: string;
  error?: string;
}

interface UploaderProps {
  endpoint: string;
  token: string;
  onUploadComplete?: (result: UploadResult) => void;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onUploadStart?: () => void;
}

function createUppy(
  endpoint: string,
  token: string,
  onComplete?: (result: UploadResult) => void
) {
  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB default
      allowedFileTypes: ["video/*"],
    },
    debug: true,
  }).use(Tus, {
    // Was having weird issue with this lib downgrading http on https,
    // somehow adding a trailing slash fixed it
    endpoint: `${endpoint}/`,
    headers: {
      "x-forwarded-proto": "https",
      Authorization: `Bearer ${token}`,
    },
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
  token,
  onUploadComplete,
  onUploadStart,
}: UploaderProps) {
  const [uppy] = useState(() => createUppy(endpoint, token, onUploadComplete));
  const [fileAdded, setFileAdded] = useState(false);

  useEffect(() => {
    const handleFileAdded = () => {
      if (uppy.getFiles().length > 0) {
        setFileAdded(true);
        onUploadStart?.();
        console.log(uppy.getState());
        uppy.upload();
      }
    };

    uppy.on("file-added", handleFileAdded);

    return () => {
      uppy.off("file-added", handleFileAdded);
    };
  }, [uppy]);

  return (
    <UppyContextProvider uppy={uppy}>
      <div className="uploader-container space-y-4">
        {fileAdded ? (
          <UppyProgressBar uppy={uppy} />
        ) : (
          <UppyFileDropZone uppy={uppy} />
        )}
      </div>
    </UppyContextProvider>
  );
}
