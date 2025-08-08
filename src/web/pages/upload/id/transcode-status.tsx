"use client";

import { useSSE } from "../../../shared/hooks/sse";
import { useState, useEffect } from "react";
import { link } from "../../../shared/links";

export const TranscodeStatus = ({
  url,
  jobId,
  videoId,
}: {
  url: string;
  jobId: string;
  videoId: string;
}) => {
  const [progress, setProgress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  const { connectionState, connectionError, addListener, closeConnection } =
    useSSE(`${url}/progress/${jobId}`, {});

  useEffect(() => {
    addListener("connected", (data) => {
      setIsConnected(true);
    });

    addListener("progress", (data) => {
      setProgress(data);
    });

    addListener("failed", (data) => {
      alert("Transcoding failed! Please try again.");
      closeConnection();
    });

    addListener("complete", (data) => {
      alert("Upload complete!");
      closeConnection();
      window.location.href = link("/video/:id", { id: videoId });
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

  return (
    <div>
      <p>Connection State: {connectionState}</p>
      {isConnected && <p>✅ Connected to transcoding stream</p>}
      {connectionError && <p>❌ Error: {connectionError.type}</p>}
      {progress ? <p>Progress: {progress}</p> : <p>Waiting for progress...</p>}
    </div>
  );
};
