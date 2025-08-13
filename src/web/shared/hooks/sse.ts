import { useEffect, useState, useCallback, useRef } from "react";
import ky from "ky";

interface EventData {
  [key: string]: string;
}

interface SSEOptions {
  headers?: Record<string, string>;
}

type ConnectionState = "CONNECTING" | "OPEN" | "CLOSED";

/**
 * Simple SSE hook using ky for consistent API
 */
export const useSSE = (url: string, options?: SSEOptions) => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("CONNECTING");
  const [connectionError, setConnectionError] = useState<Event | null>(null);
  const [eventData, setEventData] = useState<EventData>({});
  const listenersRef = useRef<Map<string, ((data: string) => void)[]>>(
    new Map()
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const addListener = useCallback(
    (eventName: string, eventHandler: (data: string) => void) => {
      if (!listenersRef.current.has(eventName)) {
        listenersRef.current.set(eventName, []);
      }
      listenersRef.current.get(eventName)!.push(eventHandler);
    },
    []
  );

  useEffect(() => {
    // Abort any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    ky.get(url, {
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        ...options?.headers,
      },
      signal: abortControllerRef.current.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) throw new Error("No response body");

        setConnectionState("OPEN");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) return;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              let currentEvent = "message";
              let currentData = "";

              for (const line of lines) {
                if (line.startsWith("event: ")) {
                  currentEvent = line.slice(7);
                } else if (line.startsWith("data: ")) {
                  currentData = line.slice(6);
                } else if (line === "") {
                  // Empty line indicates end of event
                  if (currentData) {
                    setEventData((prev) => ({
                      ...prev,
                      [currentEvent]: currentData,
                    }));

                    // Trigger custom event listeners
                    const listeners = listenersRef.current.get(currentEvent);
                    if (listeners) {
                      listeners.forEach((listener) => listener(currentData));
                    }
                  }
                  currentEvent = "message";
                  currentData = "";
                }
              }

              readStream();
            })
            .catch((error) => {
              if (error.name !== "AbortError") {
                setConnectionState("CLOSED");
                setConnectionError(error);
              }
            });
        };

        readStream();
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setConnectionState("CLOSED");
          setConnectionError(error);
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [url]); // Only depend on url, not options.headers

  const closeConnection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    connectionState,
    connectionError,
    addListener,
    closeConnection,
    eventData,
  };
};
