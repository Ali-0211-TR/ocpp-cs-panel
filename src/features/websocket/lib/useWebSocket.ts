import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WS_URL, WS_RECONNECT_INTERVAL, WS_MAX_RECONNECT_ATTEMPTS } from '@shared/config';
import { useWebSocketStore } from '../model/wsStore';
import type { WsEvent, WsEventType } from '@shared/api';
import { chargePointKeys } from '@entities/charge-point';
import { transactionKeys } from '@entities/transaction';
import { monitoringKeys } from '@entities/monitoring';

interface UseWebSocketOptions {
  enabled?: boolean;
  chargePointId?: string;
  eventTypes?: WsEventType[];
  onEvent?: (event: WsEvent) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true, chargePointId, eventTypes, onEvent } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isConnectingRef = useRef(false);
  
  const queryClient = useQueryClient();
  
  // Get stable references from store
  const setStatus = useWebSocketStore((state) => state.setStatus);
  const addEvent = useWebSocketStore((state) => state.addEvent);

  // Memoize event types to avoid unnecessary reconnections
  const eventTypesKey = useMemo(() => eventTypes?.join(',') || '', [eventTypes]);

  // Build WebSocket URL with query params
  const wsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (chargePointId) {
      params.set('charge_point_id', chargePointId);
    }
    if (eventTypesKey) {
      params.set('event_types', eventTypesKey);
    }
    const queryString = params.toString();
    return queryString ? `${WS_URL}?${queryString}` : WS_URL;
  }, [chargePointId, eventTypesKey]);

  // Store onEvent in ref to avoid dependency issues
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Handle incoming events and update React Query cache
  const handleEvent = useCallback((event: WsEvent) => {
    addEvent(event);
    onEventRef.current?.(event);

    // Update React Query cache based on event type
    switch (event.event_type) {
      case 'charge_point_connected':
      case 'charge_point_disconnected':
        queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
        break;

      case 'boot_notification':
        queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
        break;

      case 'heartbeat_received':
        queryClient.invalidateQueries({ 
          queryKey: chargePointKeys.detail(event.charge_point_id) 
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.heartbeats() });
        break;

      case 'connector_status_changed':
        queryClient.invalidateQueries({ 
          queryKey: chargePointKeys.detail(event.charge_point_id) 
        });
        queryClient.invalidateQueries({ queryKey: chargePointKeys.list() });
        break;

      case 'transaction_started':
        queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        queryClient.invalidateQueries({ 
          queryKey: chargePointKeys.detail(event.charge_point_id) 
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.stats() });
        break;

      case 'transaction_stopped':
        queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        queryClient.invalidateQueries({ 
          queryKey: chargePointKeys.detail(event.charge_point_id) 
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.stats() });
        break;

      case 'meter_values':
        const txData = event.data as { transaction_id?: number };
        if (txData.transaction_id) {
          queryClient.invalidateQueries({ 
            queryKey: transactionKeys.detail(txData.transaction_id) 
          });
        }
        break;

      case 'authorization_result':
        break;

      case 'error':
        console.error('WebSocket error event:', event.data);
        break;
    }
  }, [queryClient, addEvent]);

  // Connect to WebSocket
  useEffect(() => {
    // Don't connect if not enabled (e.g., not authenticated yet)
    if (!enabled) return;

    // Prevent multiple connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
        return;
      }

      isConnectingRef.current = true;
      setStatus('connecting');
      
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          isConnectingRef.current = false;
          setStatus('connected');
          reconnectAttempts.current = 0;
          console.log('WebSocket connected');
        };

        ws.onmessage = (message) => {
          try {
            const event: WsEvent = JSON.parse(message.data);
            handleEvent(event);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          isConnectingRef.current = false;
          setStatus('error');
        };

        ws.onclose = () => {
          isConnectingRef.current = false;
          setStatus('disconnected');
          wsRef.current = null;

          // Attempt reconnection
          if (reconnectAttempts.current < WS_MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts.current++;
            console.log(`WebSocket reconnecting... (attempt ${reconnectAttempts.current})`);
            reconnectTimeout.current = setTimeout(connect, WS_RECONNECT_INTERVAL);
          } else {
            console.log('WebSocket max reconnection attempts reached');
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        isConnectingRef.current = false;
        setStatus('error');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      reconnectAttempts.current = WS_MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, wsUrl, setStatus, handleEvent]);

  // Manual controls
  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    reconnectAttempts.current = WS_MAX_RECONNECT_ATTEMPTS;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, [setStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    // The effect will handle reconnection
  }, [disconnect]);

  return {
    reconnect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
