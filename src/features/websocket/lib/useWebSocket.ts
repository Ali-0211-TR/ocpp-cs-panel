import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WS_URL, WS_RECONNECT_INTERVAL, WS_MAX_RECONNECT_ATTEMPTS } from '@shared/config';
import { useWebSocketStore } from '../model/wsStore';
import type { WsEvent, WsEventType } from '@shared/api';
import { chargePointKeys } from '@entities/charge-point';
import { transactionKeys } from '@entities/transaction';
import { monitoringKeys } from '@entities/monitoring';
import { toast } from 'sonner';

interface UseWebSocketOptions {
  enabled?: boolean;
  chargePointId?: string;
  eventTypes?: WsEventType[];
  onEvent?: (event: WsEvent) => void;
}

/**
 * Convert PascalCase to snake_case.
 * e.g. "TransactionStopped" → "transaction_stopped"
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Transform a raw backend WebSocket message into the frontend WsEvent format.
 *
 * Backend sends (Rust serde tagged enum):
 *   { id, timestamp, type: "TransactionStopped", data: { charge_point_id, ... } }
 *
 * Frontend expects:
 *   { id, timestamp, event_type: "transaction_stopped", charge_point_id, data: { ... } }
 */
function parseWsMessage(raw: unknown): WsEvent | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const msg = raw as Record<string, unknown>;

  // Skip the welcome/system message from the server
  const type = msg.type as string | undefined;
  if (!type || type === 'connected') return null;

  const eventType = toSnakeCase(type) as WsEventType;
  const data = (msg.data || {}) as Record<string, unknown>;
  const chargePointId = (data.charge_point_id || '') as string;

  return {
    id: (msg.id || '') as string,
    timestamp: (msg.timestamp || new Date().toISOString()) as string,
    event_type: eventType,
    charge_point_id: chargePointId,
    data,
  };
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true, chargePointId, eventTypes, onEvent } = options;
  const wsRef = useRef<WebSocket | null>(null);

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

    const cpId = event.charge_point_id;

    // Update React Query cache based on event type
    switch (event.event_type) {
      case 'charge_point_connected':
      case 'charge_point_disconnected':
        queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
        if (event.event_type === 'charge_point_disconnected') {
          toast.warning(`Станция ${cpId} отключилась`);
        }
        break;

      case 'charge_point_status_changed':
        queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
        break;

      case 'boot_notification':
        queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
        break;

      case 'heartbeat_received':
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.detail(cpId),
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.heartbeats() });
        break;

      case 'connector_status_changed':
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.detail(cpId),
        });
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.connectors(cpId),
        });
        queryClient.invalidateQueries({ queryKey: chargePointKeys.list() });
        break;

      case 'transaction_started': {
        queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.detail(cpId),
        });
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.connectors(cpId),
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.stats() });

        const startData = event.data as { connector_id?: number; id_tag?: string; transaction_id?: number };
        toast.info(
          `⚡ Зарядка начата на ${cpId}, коннектор #${startData.connector_id ?? '?'}` +
          (startData.transaction_id ? ` (транзакция #${startData.transaction_id})` : ''),
        );
        break;
      }

      case 'transaction_stopped': {
        queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.detail(cpId),
        });
        queryClient.invalidateQueries({
          queryKey: chargePointKeys.connectors(cpId),
        });
        queryClient.invalidateQueries({ queryKey: monitoringKeys.stats() });

        const stopData = event.data as {
          transaction_id?: number;
          energy_consumed_kwh?: number;
          total_cost?: number;
          currency?: string;
          reason?: string;
        };
        const energy = stopData.energy_consumed_kwh?.toFixed(2) ?? '?';
        const cost = stopData.total_cost != null ? stopData.total_cost.toFixed(0) : '?';
        const curr = stopData.currency || 'UZS';
        const reason = stopData.reason ? ` (${stopData.reason})` : '';
        toast.info(
          `🔌 Зарядка завершена на ${cpId}` +
          (stopData.transaction_id ? `, транзакция #${stopData.transaction_id}` : '') +
          `: ${energy} кВт·ч, ${cost} ${curr}${reason}`,
        );
        break;
      }

      case 'meter_values':
      case 'meter_values_received': {
        const mvData = event.data as { transaction_id?: number; connector_id?: number };
        if (mvData.transaction_id) {
          queryClient.invalidateQueries({
            queryKey: transactionKeys.detail(mvData.transaction_id),
          });
        }
        // Also invalidate active transactions so ConnectorActionCard shows updated energy
        if (cpId) {
          queryClient.invalidateQueries({
            queryKey: transactionKeys.activeByChargePoint(cpId),
          });
        }
        break;
      }

      case 'authorization_result':
        break;

      case 'error':
        console.error('WebSocket error event:', event.data);
        toast.error(`Ошибка станции ${cpId}: ${(event.data as { message?: string }).message || 'Неизвестная ошибка'}`);
        break;
    }
  }, [queryClient, addEvent]);

  // Store handleEvent in a ref so the WS effect doesn't re-run when it changes
  const handleEventRef = useRef(handleEvent);
  useEffect(() => {
    handleEventRef.current = handleEvent;
  }, [handleEvent]);

  // Connect to WebSocket
  useEffect(() => {
    // Don't connect if not enabled (e.g., not authenticated yet)
    if (!enabled) return;

    let cancelled = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const connect = () => {
      if (cancelled) return;

      setStatus('connecting');

      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (cancelled) { ws?.close(); return; }
          setStatus('connected');
          attempts = 0;
          console.log('WebSocket connected');
        };

        ws.onmessage = (message) => {
          if (cancelled) return;
          try {
            const raw = JSON.parse(message.data);
            const event = parseWsMessage(raw);
            if (event) {
              handleEventRef.current(event);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          if (cancelled) return;
          console.error('WebSocket error:', error);
          setStatus('error');
        };

        ws.onclose = () => {
          if (cancelled) return;
          setStatus('disconnected');
          wsRef.current = null;
          ws = null;

          // Attempt reconnection
          if (attempts < WS_MAX_RECONNECT_ATTEMPTS) {
            attempts++;
            console.log(`WebSocket reconnecting... (attempt ${attempts})`);
            reconnectTimer = setTimeout(connect, WS_RECONNECT_INTERVAL);
          } else {
            console.log('WebSocket max reconnection attempts reached');
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setStatus('error');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
        ws = null;
      }
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, wsUrl]);

  // Manual controls
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnection
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, [setStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    // Re-enabling will be handled by the effect when enabled stays true
  }, [disconnect]);

  return {
    reconnect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
