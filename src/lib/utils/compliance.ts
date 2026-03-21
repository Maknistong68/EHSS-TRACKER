/**
 * Saudi Labor Law Compliance Utilities
 */

/**
 * Check if current date falls within heat stress restriction period
 * Saudi Arabia: June 15 - September 15, outdoor work banned 12:00 - 15:00
 */
export function isHeatStressPeriod(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if (month === 6 && day >= 15) return true;
  if (month > 6 && month < 9) return true;
  if (month === 9 && day <= 15) return true;
  return false;
}

/**
 * Check if current time is within the outdoor work ban window (12:00 - 15:00)
 */
export function isOutdoorWorkBanned(date: Date = new Date()): boolean {
  if (!isHeatStressPeriod(date)) return false;
  const hour = date.getHours();
  return hour >= 12 && hour < 15;
}

/**
 * Get heat stress alert message if applicable
 */
export function getHeatStressAlert(date: Date = new Date()): { active: boolean; message: string; severity: 'warning' | 'critical' | 'none' } {
  if (!isHeatStressPeriod(date)) {
    return { active: false, message: '', severity: 'none' };
  }

  if (isOutdoorWorkBanned(date)) {
    return {
      active: true,
      message: 'OUTDOOR WORK BAN IN EFFECT (12:00-15:00). All outdoor work must stop immediately per Saudi Labor Law.',
      severity: 'critical',
    };
  }

  return {
    active: true,
    message: 'Heat Stress Period Active (Jun 15 - Sep 15). Ensure adequate hydration, rest breaks, and shade. Outdoor work banned 12:00-15:00.',
    severity: 'warning',
  };
}

/**
 * Saudi working hours limits
 */
export const WORKING_HOURS = {
  regular: {
    dailyMax: 8,
    weeklyMax: 48,
    description: 'Standard working hours: 8h/day, 48h/week',
  },
  ramadan: {
    dailyMax: 6,
    weeklyMax: 36,
    description: 'Ramadan working hours: 6h/day, 36h/week (for Muslim workers)',
  },
  overtime: {
    maxPercentage: 10,
    warningThreshold: 8,
    description: 'Overtime should not exceed 10% of regular hours',
  },
};

/**
 * Check if overtime percentage exceeds Saudi labor law threshold
 */
export function checkOvertimeCompliance(otPercentage: number): { compliant: boolean; message: string; severity: 'success' | 'warning' | 'danger' } {
  if (otPercentage <= WORKING_HOURS.overtime.warningThreshold) {
    return { compliant: true, message: 'Overtime within acceptable limits', severity: 'success' };
  }
  if (otPercentage <= WORKING_HOURS.overtime.maxPercentage) {
    return { compliant: true, message: 'Overtime approaching maximum threshold', severity: 'warning' };
  }
  return { compliant: false, message: `Overtime exceeds ${WORKING_HOURS.overtime.maxPercentage}% threshold`, severity: 'danger' };
}

/**
 * Calculate working hours compliance
 */
export function calculateHoursCompliance(
  dailyHours: number,
  isRamadan: boolean = false
): { compliant: boolean; message: string } {
  const limit = isRamadan ? WORKING_HOURS.ramadan.dailyMax : WORKING_HOURS.regular.dailyMax;
  if (dailyHours <= limit) {
    return { compliant: true, message: `Within ${isRamadan ? 'Ramadan' : 'standard'} daily limit (${limit}h)` };
  }
  return { compliant: false, message: `Exceeds ${isRamadan ? 'Ramadan' : 'standard'} daily limit of ${limit}h` };
}

/**
 * Approximate Ramadan dates (should be updated yearly - these are approximations)
 * In production, use an Islamic calendar API
 */
export function isApproximatelyRamadan(date: Date = new Date()): boolean {
  const year = date.getFullYear();
  // Approximate Ramadan dates (shifts ~11 days earlier each year)
  const ramadanDates: Record<number, [number, number, number, number]> = {
    // [startMonth, startDay, endMonth, endDay] (0-indexed months)
    2024: [2, 11, 3, 9],   // Mar 11 - Apr 9
    2025: [2, 1, 2, 30],   // Mar 1 - Mar 30
    2026: [1, 18, 2, 19],  // Feb 18 - Mar 19
    2027: [1, 8, 2, 8],    // Feb 8 - Mar 8
    2028: [0, 28, 1, 25],  // Jan 28 - Feb 25
  };

  const dates = ramadanDates[year];
  if (!dates) return false;

  const start = new Date(year, dates[0], dates[1]);
  const end = new Date(year, dates[2], dates[3]);
  return date >= start && date <= end;
}
