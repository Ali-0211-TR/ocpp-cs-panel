import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WS_URL, WS_RECONNECT_INTERVAL, WS_MAX_RECONNECT_ATTEMPTS } from '@shared/config';
import { useWebSocketStore } from '../model/wsStore';
import type { WsEvent, WsEventType } from '@shared/api';
import { chargePointKeys } from '@entities/charge-point';
import { transactionKeys } from '@entities/transaction';
import { monitoringKeys } from '@entities/monitoring';

interface UseWebSocketOptions {
  chargePointId?: string;
  eventTypes?: WsEventType[];
  onEvent?: (event: WsEvent) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { chargePointId, eventTypes, onEvent } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const queryClient = useQueryClient();
  const { setStatus, addEvent } = useWebSocketStore();

  // Build WebSocket URL with query params
  const buildWsUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (chargePointId) {
      params.set('charge_point_id', chargePointId);
    }
    if (eventTypes && eventTypes.length > 0) {
      params.set('event_types', eventTypes.join(','));
    }
    const queryString = params.toString();
    return queryString ? `${WS_URL}?${queryString}` : WS_URL;
  }, [chargePointId, eventTypes]);

  // Handle incoming events and update React Query cache
  const handleEvent = useCallback((event: WsEvent) => {
    addEvent(event);
    onEvent?.(event);

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
        // Update specific charge point's last_heartbeat in cache
        queryClient.invalidateQueries({ 
          queryKey: chargePointKeys.detail(event.charge_point_id) 
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.heartbeats() });
        break;

      case 'connector_status_changed':
        // Update charge point connector status
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
        // Update specific transaction meter values
        const txData = event.data as { transaction_id?: number };
        if (txData.transaction_id) {
          queryClient.invalidateQueries({ 
            queryKey: transactionKeys.detail(txData.transaction_id) 
          });
        }
        break;

      case 'authorization_result':
        // Optionally refresh ID tags
        break;

      case 'error':
        console.error('WebSocket error event:', event.data);
        break;
    }
  }, [queryClient, addEvent, onEvent]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');
    const url = buildWsUrl();
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
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
        setStatus('error');
      };

      ws.onclose = () => {
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
      setStatus('error');
    }
  }, [buildWsUrl, setStatus, handleEvent]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectAttempts.current = WS_MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('disconnected');
  }, [setStatus]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
