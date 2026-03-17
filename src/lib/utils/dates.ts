import { differenceInDays, format, parseISO, isValid } from 'date-fns';

export type ExpiryStatus = 'Valid' | 'Expiring' | 'Expired';

/**
 * Calculate days remaining until expiry date
 */
export function daysUntilExpiry(expiryDate: string | Date | null): number | null {
  if (!expiryDate) return null;
  const date = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  if (!isValid(date)) return null;
  return differenceInDays(date, new Date());
}

/**
 * Get expiry status based on days remaining
 * Expired: past due
 * Expiring: within 30 days
 * Valid: more than 30 days
 */
export function getExpiryStatus(expiryDate: string | Date | null, warningDays: number = 30): ExpiryStatus {
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return 'Valid';
  if (days < 0) return 'Expired';
  if (days <= warningDays) return 'Expiring';
  return 'Valid';
}

/**
 * Get color classes for expiry status
 */
export function expiryStatusColor(status: ExpiryStatus): string {
  switch (status) {
    case 'Expired': return 'bg-red-100 text-red-800';
    case 'Expiring': return 'bg-amber-100 text-amber-800';
    case 'Valid': return 'bg-green-100 text-green-800';
  }
}

/**
 * Format a date string for display
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, 'dd MMM yyyy');
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateInput(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
}

export const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
];
