import { create } from 'zustand';
import type { WsEvent } from '@shared/api';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketState {
  status: ConnectionStatus;
  events: WsEvent[];
  maxEvents: number;
  
  // Actions
  setStatus: (status: ConnectionStatus) => void;
  addEvent: (event: WsEvent) => void;
  clearEvents: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: 'disconnected',
  events: [],
  maxEvents: 100,

  setStatus: (status) => set({ status }),

  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, state.maxEvents),
  })),

  clearEvents: () => set({ events: [] }),
}));

// Selectors
export const useWsStatus = () => useWebSocketStore((state) => state.status);
export const useWsEvents = () => useWebSocketStore((state) => state.events);
export const useLatestEvents = (count: number = 10) => 
  useWebSocketStore((state) => state.events.slice(0, count));
