import { useEffect, useRef } from 'react';
import { useWebSocketStore } from './ws.store';

/**
 * Subscribe to a specific WebSocket event type.
 * Automatically subscribes/unsubscribes on mount/unmount.
 */
export function useWebSocketEvent<T = unknown>(
  eventType: string,
  callback: (data: T) => void,
) {
  const subscribe = useWebSocketStore((s) => s.subscribe);
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const unsub = subscribe(eventType, (data) => {
      cbRef.current(data as T);
    });
    return unsub;
  }, [eventType, subscribe]);
}
