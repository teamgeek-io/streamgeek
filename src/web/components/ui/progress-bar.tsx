import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./card";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  progress: number; // 0-100
  fileName?: string;
  uploadedSize?: string;
  totalSize?: string;
  className?: string;
  showDetails?: boolean;
}

export function ProgressBar({
  progress,
  fileName,
  uploadedSize,
  totalSize,
  className,
  showDetails = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {showDetails && fileName && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground truncate">
                {fileName}
              </span>
              {uploadedSize && totalSize && (
                <span className="text-muted-foreground text-xs">
                  {uploadedSize} / {totalSize}
                </span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-muted-foreground font-medium">
                {clampedProgress.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UppyProgressBarProps {
  uppy: any;
  className?: string;
}

export function UppyProgressBar({ uppy, className }: UppyProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    const handleProgress = (file: any, progressData: any) => {
      if (
        progressData &&
        progressData.bytesUploaded &&
        progressData.bytesTotal
      ) {
        const percentage =
          (progressData.bytesUploaded / progressData.bytesTotal) * 100;
        setProgress(percentage);
        setCurrentFile(file);
        setUploadedBytes(progressData.bytesUploaded);
        setTotalBytes(progressData.bytesTotal);
      }
    };

    const handleUploadSuccess = () => {
      setProgress(100);
      // Keep showing 100% for a moment before hiding
      setTimeout(() => {
        setProgress(0);
        setCurrentFile(null);
        setUploadedBytes(0);
        setTotalBytes(0);
      }, 2000);
    };

    const handleUploadError = () => {
      setProgress(0);
      setCurrentFile(null);
      setUploadedBytes(0);
      setTotalBytes(0);
    };

    uppy.on("upload-progress", handleProgress);
    uppy.on("upload-success", handleUploadSuccess);
    uppy.on("upload-error", handleUploadError);

    return () => {
      uppy.off("upload-progress", handleProgress);
      uppy.off("upload-success", handleUploadSuccess);
      uppy.off("upload-error", handleUploadError);
    };
  }, [uppy]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ProgressBar
      progress={progress}
      fileName={currentFile?.name}
      uploadedSize={formatBytes(uploadedBytes)}
      totalSize={formatBytes(totalBytes)}
      className={className}
    />
  );
}
