import { create } from 'zustand';
import { ENV } from '@shared/config/env';

export interface WsMessage<T = unknown> {
  event: string;
  data: T;
  timestamp?: string;
}

interface WebSocketState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WsMessage | null;
  _ws: WebSocket | null;
  _listeners: Map<string, Set<(data: unknown) => void>>;
  _reconnectAttempts: number;
  _maxReconnectAttempts: number;
  connect: (token?: string) => void;
  disconnect: () => void;
  send: <T>(event: string, data: T) => void;
  subscribe: (event: string, cb: (data: unknown) => void) => () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  status: 'disconnected',
  lastMessage: null,
  _ws: null,
  _listeners: new Map(),
  _reconnectAttempts: 0,
  _maxReconnectAttempts: 10,

  connect: (token?: string) => {
    const { _ws } = get();
    if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const authToken = token ?? localStorage.getItem('auth_token') ?? '';
    const url = `${ENV.WS_URL}?token=${authToken}`;

    set({ status: 'connecting' });
    const ws = new WebSocket(url);

    ws.onopen = () => {
      set({ status: 'connected', _reconnectAttempts: 0 });
    };

    ws.onclose = () => {
      set({ status: 'disconnected', _ws: null });
      // exponential backoff reconnect
      const { _reconnectAttempts, _maxReconnectAttempts } = get();
      if (_reconnectAttempts < _maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** _reconnectAttempts, 30_000);
        set({ _reconnectAttempts: _reconnectAttempts + 1 });
        setTimeout(() => get().connect(), delay);
      }
    };

    ws.onerror = () => {
      set({ status: 'error' });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        set({ lastMessage: msg });

        // notify subscribers
        const listeners = get()._listeners.get(msg.event);
        if (listeners) {
          listeners.forEach((cb) => cb(msg.data));
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    set({ _ws: ws });
  },

  disconnect: () => {
    const { _ws } = get();
    if (_ws) {
      _ws.close();
      set({ _ws: null, status: 'disconnected', _reconnectAttempts: 999 });
    }
  },

  send: (event, data) => {
    const { _ws } = get();
    if (_ws?.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify({ event, data }));
    }
  },

  subscribe: (event, cb) => {
    const { _listeners } = get();
    if (!_listeners.has(event)) {
      _listeners.set(event, new Set());
    }
    _listeners.get(event)!.add(cb as (data: unknown) => void);

    // return unsubscribe function
    return () => {
      _listeners.get(event)?.delete(cb as (data: unknown) => void);
    };
  },
}));
