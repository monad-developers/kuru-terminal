import { KuruEvents } from "../types";

/**
 * Check if a string represents a valid event type
 * @param eventType String to validate
 * @returns boolean
 */
export function isValidEventType(eventType: string): boolean {
    return Object.values(KuruEvents).includes(eventType as KuruEvents);
  }
  
  /**
   * Check if a string represents a valid sort order
   * @param sortOrder String to validate (asc or desc)
   * @returns boolean
   */
  export function isValidSortOrder(sortOrder: string): boolean {
    return sortOrder === "asc" || sortOrder === "desc";
  }
  
  // Generate a unique ID from event data
  export function generateEventId(address: string, txHash: string, logIndex: number): string {
    return `${address.toLowerCase()}-${txHash.toLowerCase()}-${logIndex}`;
  }
  