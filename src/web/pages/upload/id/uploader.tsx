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

interface UploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

interface UploaderProps {
  endpoint: string;
  onUploadComplete?: (result: UploadResult) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[]; // e.g., ['image/*', 'video/*']
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
  }).use(Tus, { endpoint });

  // Handle upload completion
  uppy.on("complete", (result) => {
    const successful = Boolean(
      result.successful && result.successful.length > 0
    );
    const fileId = successful && result.successful?.[0]?.response?.uploadURL;

    onComplete?.({
      success: successful,
      fileId: fileId || undefined,
      error: successful ? undefined : "Upload failed",
    });
  });

  // Handle upload errors
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
  maxFileSize,
  allowedFileTypes,
}: UploaderProps) {
  const [uppy] = useState(() => createUppy(endpoint, onUploadComplete));

  useEffect(() => {
    const restrictions: UppyOptionsWithOptionalRestrictions<
      Meta,
      Body
    >["restrictions"] = {
      maxNumberOfFiles: 1,
    };

    if (maxFileSize) {
      restrictions.maxFileSize = maxFileSize;
    }

    if (allowedFileTypes) {
      restrictions.allowedFileTypes = allowedFileTypes;
    }

    uppy.setOptions({ restrictions });
  }, [uppy, maxFileSize, allowedFileTypes]);

  // Auto-upload when file is selected
  useEffect(() => {
    const handleFileAdded = () => {
      if (uppy.getFiles().length > 0) {
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
      <div className="uploader-container">
        <DragDrop
          uppy={uppy}
          locale={{
            strings: {
              dropHereOr: "Drop file here or %{browse}",
              browse: "browse",
            },
          }}
        />
        <ProgressBar uppy={uppy} />
      </div>
    </UppyContextProvider>
  );
}
