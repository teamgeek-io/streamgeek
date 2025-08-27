"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

export interface UppyFileDropZoneProps {
  uppy: Uppy;
  className?: string;
  onFileAdded?: (file: any) => void;
  onFileRemoved?: (file: any) => void;
}

export function UppyFileDropZone({
  uppy,
  className,
  onFileAdded,
  onFileRemoved,
}: UppyFileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen to Uppy events
  useEffect(() => {
    const handleFileAdded = (file: any) => {
      setFiles(uppy.getFiles());
      onFileAdded?.(file);
    };

    const handleFileRemoved = (file: any) => {
      setFiles(uppy.getFiles());
      onFileRemoved?.(file);
    };

    const handleStateChange = () => {
      setFiles(uppy.getFiles());
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("file-removed", handleFileRemoved);
    uppy.on("state-update", handleStateChange);

    // Initialize files state
    setFiles(uppy.getFiles());

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("file-removed", handleFileRemoved);
      uppy.off("state-update", handleStateChange);
    };
  }, [uppy, onFileAdded, onFileRemoved]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      // Let Uppy handle the file processing
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file) => {
        uppy.addFile({
          source: "drop",
          name: file.name,
          type: file.type,
          data: file,
        });
      });
    },
    [uppy]
  );

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        uppy.addFile({
          source: "input",
          name: file.name,
          type: file.type,
          data: file,
        });
      });
    }

    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    uppy.removeFile(fileId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get acceptance text from Uppy restrictions
  const getAcceptanceText = () => {
    const restrictions = uppy.opts.restrictions;
    const parts = [];

    if (restrictions?.allowedFileTypes?.length) {
      parts.push(`Accepts: ${restrictions.allowedFileTypes.join(", ")}`);
    } else {
      parts.push("All file types supported");
    }

    if (restrictions?.maxNumberOfFiles) {
      const fileText = restrictions.maxNumberOfFiles === 1 ? "file" : "files";
      parts.push(`(max ${restrictions.maxNumberOfFiles} ${fileText})`);
    }

    return parts.join(" ");
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        files.length > 0 ? "pb-2" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept="video/*"
        multiple={false}
      />

      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <UploadIcon className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">
          Drag & drop a video file here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">{getAcceptanceText()}</p>

        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          Select video file
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 rounded-md border border-border p-2 bg-background"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
