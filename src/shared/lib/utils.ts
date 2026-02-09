import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CONNECTOR_STATUSES, 
  ID_TAG_STATUSES, 
  TRANSACTION_STATUSES,
  DEFAULT_CURRENCY,
  DATE_FORMAT 
} from '@shared/config';

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date with Russian locale
export function formatDate(
  date: string | Date | null | undefined,
  formatType: 'full' | 'short' | 'relative' = 'full'
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  switch (formatType) {
    case 'short':
      return format(d, 'dd.MM.yyyy', { locale: ru });
    case 'relative':
      return formatDistanceToNow(d, { addSuffix: true, locale: ru });
    case 'full':
    default:
      return format(d, DATE_FORMAT, { locale: ru });
  }
}

// Format date short
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd.MM.yyyy', { locale: ru });
}

// Time ago (e.g., "5 минут назад")
export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ru });
}

// Format energy from Wh to kWh
export function formatEnergy(wh: number | null | undefined): string {
  if (wh === null || wh === undefined) return '0 кВт·ч';
  const kwh = wh / 1000;
  return `${kwh.toFixed(2)} кВт·ч`;
}

// Format energy short (just number)
export function formatEnergyValue(wh: number | null | undefined): string {
  if (wh === null || wh === undefined) return '0.00';
  return (wh / 1000).toFixed(2);
}

// Format currency (smallest unit to main unit)
// Backend stores money in smallest unit (e.g., tiyin for UZS, cents for USD)
export function formatCurrency(
  amount: number | null | undefined, 
  currency: string = DEFAULT_CURRENCY
): string {
  if (amount === null || amount === undefined) return `0.00 ${currency}`;
  const mainUnit = amount / 100;
  return `${mainUnit.toLocaleString('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })} ${currency}`;
}

// Format currency short (just number)
export function formatCurrencyValue(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0.00';
  return (amount / 100).toLocaleString('ru-RU', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

// Format duration from seconds to human readable
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0м';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  }
  return `${secs}с`;
}

// Format duration from start time to now
export function formatDurationFromStart(startTime: string | Date | null | undefined): string {
  if (!startTime) return '0м';
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  return formatDuration(diffSeconds);
}

// Get seconds since date
export function getSecondsSince(date: string | Date | null | undefined): number {
  if (!date) return 0;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return Math.floor((new Date().getTime() - d.getTime()) / 1000);
}

// Get connector status color
export function getConnectorStatusColor(status: string): string {
  const statusInfo = CONNECTOR_STATUSES[status as keyof typeof CONNECTOR_STATUSES];
  return statusInfo?.color || 'slate';
}

// Get connector status label
export function getConnectorStatusLabel(status: string): string {
  const statusInfo = CONNECTOR_STATUSES[status as keyof typeof CONNECTOR_STATUSES];
  return statusInfo?.label || status;
}

// Get ID tag status color
export function getIdTagStatusColor(status: string): string {
  const statusInfo = ID_TAG_STATUSES[status as keyof typeof ID_TAG_STATUSES];
  return statusInfo?.color || 'slate';
}

// Get ID tag status label
export function getIdTagStatusLabel(status: string): string {
  const statusInfo = ID_TAG_STATUSES[status as keyof typeof ID_TAG_STATUSES];
  return statusInfo?.label || status;
}

// Get transaction status color
export function getTransactionStatusColor(status: string): string {
  const statusInfo = TRANSACTION_STATUSES[status as keyof typeof TRANSACTION_STATUSES];
  return statusInfo?.color || 'slate';
}

// Get transaction status label
export function getTransactionStatusLabel(status: string): string {
  const statusInfo = TRANSACTION_STATUSES[status as keyof typeof TRANSACTION_STATUSES];
  return statusInfo?.label || status;
}

// Online/Offline status
export function getOnlineStatusColor(isOnline: boolean): string {
  return isOnline ? 'emerald' : 'red';
}

export function getOnlineStatusLabel(isOnline: boolean): string {
  return isOnline ? 'Онлайн' : 'Офлайн';
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse error message from API response
export function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Произошла неизвестная ошибка';
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Format percentage
export function formatPercentage(value: number, total: number): string {
  return `${calculatePercentage(value, total)}%`;
}
