// apps/web/src/lib/utils.ts
// Utility functions for the OmniPanel web application

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  
  return date.toLocaleDateString();
}

export function formatTime(input: Date | number): string {
  if (typeof input === 'number') {
    // Handle milliseconds
    if (input < 1000) {
      return `${input.toFixed(1)}ms`;
    } else if (input < 60000) {
      return `${(input / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(input / 60000);
      const seconds = ((input % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  } else {
    // Handle Date objects
    return input.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
}
