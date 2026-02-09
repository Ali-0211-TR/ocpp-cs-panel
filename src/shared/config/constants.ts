// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_V1_URL = `${API_BASE_URL}/api/v1`;
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/v1/notifications/ws';

// Token storage keys
export const TOKEN_KEY = 'ocpp_token';
export const USER_KEY = 'ocpp_user';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// WebSocket reconnection settings
export const WS_RECONNECT_INTERVAL = 3000;
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

// Charge Point Statuses
export const CHARGE_POINT_STATUSES = {
  ONLINE: { label: 'Онлайн', color: 'emerald', variant: 'default' as const },
  OFFLINE: { label: 'Офлайн', color: 'slate', variant: 'secondary' as const },
  CHARGING: { label: 'Зарядка', color: 'blue', variant: 'default' as const },
  FAULTED: { label: 'Ошибка', color: 'red', variant: 'destructive' as const },
  Accepted: { label: 'Принят', color: 'emerald', variant: 'default' as const },
  Pending: { label: 'Ожидание', color: 'amber', variant: 'secondary' as const },
  Rejected: { label: 'Отклонён', color: 'red', variant: 'destructive' as const },
} as const;

// Connector Statuses (OCPP 1.6)
export const CONNECTOR_STATUSES = {
  Available: { label: 'Доступен', color: 'emerald', icon: '🟢' },
  Preparing: { label: 'Подготовка', color: 'amber', icon: '🟡' },
  Charging: { label: 'Зарядка', color: 'blue', icon: '⚡' },
  SuspendedEV: { label: 'Приостановлен (EV)', color: 'orange', icon: '🟠' },
  SuspendedEVSE: { label: 'Приостановлен (EVSE)', color: 'orange', icon: '🟠' },
  Finishing: { label: 'Завершение', color: 'amber', icon: '🟡' },
  Reserved: { label: 'Зарезервирован', color: 'violet', icon: '🟣' },
  Unavailable: { label: 'Недоступен', color: 'slate', icon: '⚫' },
  Faulted: { label: 'Ошибка', color: 'red', icon: '❌' },
} as const;

// IdTag Statuses
export const ID_TAG_STATUSES = {
  Accepted: { label: 'Активен', color: 'emerald', variant: 'default' as const },
  Blocked: { label: 'Заблокирован', color: 'red', variant: 'destructive' as const },
  Expired: { label: 'Истёк', color: 'amber', variant: 'secondary' as const },
  Invalid: { label: 'Недействителен', color: 'slate', variant: 'secondary' as const },
  ConcurrentTx: { label: 'Параллельные транзакции', color: 'orange', variant: 'secondary' as const },
  ACTIVE: { label: 'Активен', color: 'emerald', variant: 'default' as const },
  BLOCKED: { label: 'Заблокирован', color: 'red', variant: 'destructive' as const },
  EXPIRED: { label: 'Истёк', color: 'amber', variant: 'secondary' as const },
} as const;

// Transaction Statuses
export const TRANSACTION_STATUSES = {
  Active: { label: 'Активная', color: 'blue' },
  Completed: { label: 'Завершена', color: 'emerald' },
  Invalid: { label: 'Недействительна', color: 'red' },
} as const;

// Tariff Types
export const TARIFF_TYPES = {
  PerKwh: { label: 'За кВт·ч', description: 'Оплата за потреблённую энергию' },
  PerMinute: { label: 'За минуту', description: 'Оплата за время зарядки' },
  PerSession: { label: 'За сессию', description: 'Фиксированная плата за сессию' },
  Combined: { label: 'Комбинированный', description: 'Энергия + время + сессия' },
  FLAT: { label: 'Фиксированный', description: 'Фиксированная цена' },
  TIME_BASED: { label: 'По времени', description: 'Оплата за время' },
  ENERGY_BASED: { label: 'По энергии', description: 'Оплата за кВт·ч' },
} as const;

// Reset Types (OCPP)
export const RESET_TYPES = ['Soft', 'Hard'] as const;

// Availability Types (OCPP)
export const AVAILABILITY_TYPES = ['Operative', 'Inoperative'] as const;

// Trigger Message Types (OCPP)
export const TRIGGER_MESSAGE_TYPES = [
  'BootNotification',
  'DiagnosticsStatusNotification',
  'FirmwareStatusNotification',
  'Heartbeat',
  'MeterValues',
  'StatusNotification',
] as const;

// WebSocket Event Types
export const WS_EVENT_TYPES: Record<string, { label: string; color: string }> = {
  charge_point_connected: { label: 'Станция подключена', color: 'emerald' },
  charge_point_disconnected: { label: 'Станция отключена', color: 'red' },
  charge_point_status_changed: { label: 'Статус станции', color: 'amber' },
  boot_notification: { label: 'Загрузка станции', color: 'blue' },
  heartbeat_received: { label: 'Heartbeat', color: 'slate' },
  connector_status_changed: { label: 'Статус коннектора', color: 'amber' },
  transaction_started: { label: 'Транзакция началась', color: 'emerald' },
  transaction_stopped: { label: 'Транзакция завершена', color: 'blue' },
  meter_values: { label: 'Показания счётчика', color: 'slate' },
  meter_values_received: { label: 'Показания счётчика', color: 'slate' },
  authorization_result: { label: 'Авторизация', color: 'violet' },
  error: { label: 'Ошибка', color: 'red' },
};

// Currency
export const DEFAULT_CURRENCY = 'UZS';

// Date formats
export const DATE_FORMAT = 'dd MMM yyyy, HH:mm';
export const DATE_FORMAT_SHORT = 'dd.MM.yyyy';
export const TIME_FORMAT = 'HH:mm:ss';
