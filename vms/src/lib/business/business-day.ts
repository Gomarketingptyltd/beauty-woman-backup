import { format, addDays, subDays, parseISO, set } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const SYDNEY_TZ = "Australia/Sydney";
const BUSINESS_DAY_START_HOUR = 8; // 08:00 Sydney = start of new business day

/**
 * Returns the business day string (YYYY-MM-DD) for a given UTC timestamp.
 * Business day: 08:00 Sydney → 08:00 next day Sydney
 */
export function getBusinessDay(utcDate: Date = new Date()): string {
  const sydneyTime = toZonedTime(utcDate, SYDNEY_TZ);
  const hour = sydneyTime.getHours();

  // Before 08:00 → belongs to previous calendar day's business day
  if (hour < BUSINESS_DAY_START_HOUR) {
    return format(subDays(sydneyTime, 1), "yyyy-MM-dd");
  }
  return format(sydneyTime, "yyyy-MM-dd");
}

/**
 * Returns the current Sydney time as a Date object.
 */
export function getSydneyNow(): Date {
  return toZonedTime(new Date(), SYDNEY_TZ);
}

/**
 * Returns the start of a business day as a UTC Date.
 * Business day "2025-01-15" starts at "2025-01-15 08:00 Sydney"
 */
export function getBusinessDayStart(businessDay: string): Date {
  const date = parseISO(businessDay);
  const sydneyStart = set(date, {
    hours: BUSINESS_DAY_START_HOUR,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  return fromZonedTime(sydneyStart, SYDNEY_TZ);
}

/**
 * Returns the end of a business day as a UTC Date (next day 08:00).
 */
export function getBusinessDayEnd(businessDay: string): Date {
  return getBusinessDayStart(
    format(addDays(parseISO(businessDay), 1), "yyyy-MM-dd")
  );
}

/**
 * Returns today's business day string.
 */
export function todayBusinessDay(): string {
  return getBusinessDay(new Date());
}

/**
 * Format a datetime string to Sydney local time display.
 */
export function formatSydneyTime(
  isoString: string,
  fmt = "yyyy-MM-dd HH:mm"
): string {
  const date = toZonedTime(new Date(isoString), SYDNEY_TZ);
  return format(date, fmt);
}

/**
 * Check if current Sydney time is within business hours (10:00–05:00 next day).
 */
export function isWithinBusinessHours(): boolean {
  const sydney = getSydneyNow();
  const hour = sydney.getHours();
  // Open: 10:00 AM to 05:00 AM (next day)
  // Closed: 05:00 AM to 10:00 AM
  return !(hour >= 5 && hour < 10);
}

/**
 * Format cents to AUD display string.
 */
export function formatAUD(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function centsToAUD(cents: number): number {
  return cents / 100;
}

export function audToCents(aud: number): number {
  return Math.round(aud * 100);
}
