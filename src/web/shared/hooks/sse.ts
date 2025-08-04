import { useEffect, useState, useCallback } from "react";

interface EventData {
  [key: string]: string;
}

/**
 * @see https://gist.github.com/Mosharush/8bbc178bbc7e47c7c7c554dd7b5c5528
 */
export const useSSE = (url: string, options?: EventSourceInit) => {
  const [connectionState, setConnectionState] = useState<string>("CONNECTING");
  const [connectionError, setConnectionError] = useState<Event | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [eventData, setEventData] = useState<EventData>({});

  useEffect(() => {
    const es = new EventSource(url, options);
    setEventSource(es);

    es.onopen = () => setConnectionState("OPEN");
    es.onerror = (error: Event) => {
      setConnectionState("CLOSED");
      setConnectionError(error);
    };

    return () => es.close();
  }, []);

  const addListener = useCallback(
    (eventName: string, eventHandler: (data: string) => void) => {
      if (eventSource) {
        eventSource.addEventListener(eventName, (event: MessageEvent) => {
          eventHandler(event.data);
        });
      }
    },
    [eventSource]
  );

  const closeConnection = useCallback(
    () => eventSource?.close(),
    [eventSource]
  );

  return {
    connectionState,
    connectionError,
    addListener,
    closeConnection,
  };
};
