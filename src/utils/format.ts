import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, options: { decimals?: boolean; symbol?: boolean } = {}): string {
  const { decimals = false, symbol = true } = options;
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);

  return symbol ? `฿${formatted}` : formatted;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} · ${hours}:${minutes}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function formatElapsedTime(isoString: string): string {
  const start = new Date(isoString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - start);

  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatPhone(phone: string): string {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
}
