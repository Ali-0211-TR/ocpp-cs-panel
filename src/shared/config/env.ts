export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
  API_PREFIX: '/api/v1',
} as const;
