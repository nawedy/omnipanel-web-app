/**
 * Convert time string to milliseconds
 * Supports formats like: '1h', '30m', '7d', '1y', '3600s', '3600'
 */
export function timeStringToMs(timeString: string | number): number {
  if (typeof timeString === 'number') {
    return timeString * 1000; // Assume seconds, convert to milliseconds
  }

  const str = timeString.toString().trim();
  
  // If it's just a number, assume seconds
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10) * 1000;
  }

  // Parse time string with units
  const match = str.match(/^(\d+)([smhdwy]?)$/i);
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase() || 's'; // Default to seconds

  const multipliers = {
    's': 1000,           // seconds to milliseconds
    'm': 60 * 1000,      // minutes to milliseconds
    'h': 60 * 60 * 1000, // hours to milliseconds
    'd': 24 * 60 * 60 * 1000, // days to milliseconds
    'w': 7 * 24 * 60 * 60 * 1000, // weeks to milliseconds
    'y': 365 * 24 * 60 * 60 * 1000 // years to milliseconds
  };

  const multiplier = multipliers[unit as keyof typeof multipliers];
  if (!multiplier) {
    throw new Error(`Invalid time unit: ${unit}`);
  }

  return value * multiplier;
}

/**
 * Convert milliseconds to human readable string
 */
export function msToTimeString(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Add time to a date
 */
export function addTime(date: Date, timeString: string | number): Date {
  const ms = timeStringToMs(timeString);
  return new Date(date.getTime() + ms);
}

/**
 * Check if a date is expired
 */
export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Get time until expiration in milliseconds
 */
export function timeUntilExpiration(date: Date): number {
  return Math.max(0, date.getTime() - Date.now());
}

/**
 * Convert time string to seconds
 */
export function timeStringToSeconds(timeString: string): number {
  return Math.floor(timeStringToMs(timeString) / 1000);
} 