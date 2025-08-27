"use client";

import { useSSE } from "../../../shared/hooks/sse";
import { useState, useEffect } from "react";
import { link } from "../../../shared/links";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle, AlertCircle, Wifi, WifiOff, Loader2 } from "lucide-react";

export const TranscodeStatus = ({
  url,
  token,
  jobId,
  videoId,
}: {
  url: string;
  token: string;
  jobId: string;
  videoId: string;
}) => {
  const lsKey = `transcode-progress-${jobId}`;
  const [progress, setProgress] = useState<string>(
    typeof window !== "undefined"
      ? window.localStorage.getItem(lsKey) ?? ""
      : ""
  );
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<
    "waiting" | "processing" | "complete" | "failed"
  >("waiting");

  useEffect(() => {
    localStorage?.setItem(lsKey, progress);
  }, [progress]);

  const { connectionState, connectionError, closeConnection, addListener } =
    useSSE(`${url}/progress/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  useEffect(() => {
    addListener("connected", (data) => {
      setIsConnected(true);
      setStatus("processing");
    });

    addListener("progress", (data) => {
      setProgress(data);
      setStatus("processing");
    });

    addListener("failed", (data) => {
      setStatus("failed");
      closeConnection();
      window?.localStorage.removeItem(lsKey);
    });

    addListener("complete", (data) => {
      setStatus("complete");
      closeConnection();
      window?.localStorage.removeItem(lsKey);

      // Show completion status for 2 seconds before redirecting
      setTimeout(() => {
        window.location.href = link("/video/:id", { id: videoId });
      }, 2000);
    });

    addListener("heartbeat", (data) => {
      console.log("Heartbeat received:", data);
    });
  }, [addListener, setProgress, setIsConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);

  const getStatusIcon = () => {
    switch (status) {
      case "waiting":
        return (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        );
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        );
    }
  };

  const getStatusText = () => {
    if (connectionError) {
      return `Connection error: ${connectionError.type}`;
    }

    if (!isConnected) {
      return "Connecting to processing server...";
    }

    if (progress) {
      return progress;
    }

    switch (status) {
      case "waiting":
        return "Waiting for transcoding to start...";
      case "processing":
        return "Processing video...";
      case "complete":
        return "Processing complete!";
      case "failed":
        return "Processing failed";
      default:
        return "Processing...";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-lg">Video Processing</h3>
              <p className="text-sm text-muted-foreground">{getStatusText()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
