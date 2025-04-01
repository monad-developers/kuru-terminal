/**
 * Converts milliseconds to a cron expression
 * @param intervalMs Interval in milliseconds
 * @returns Cron expression
 */
export function convertIntervalToCronExpression(intervalMs: number): string {
  // If interval is less than a minute, return a seconds-based cron
  if (intervalMs < 60000) {
    // The pattern is '*/X * * * * *' where X is seconds (maximum 59)
    const seconds = Math.max(1, Math.floor(intervalMs / 1000));
    return `*/${Math.min(seconds, 59)} * * * * *`;
  }
  
  // Convert to minutes for larger intervals
  const minutes = Math.floor(intervalMs / 60000);
  
  if (minutes < 60) {
    // Run every X minutes
    return `*/${minutes} * * * *`;
  } else {
    // For very large intervals (hours+), default to hourly
    return `0 * * * *`;
  }
}
