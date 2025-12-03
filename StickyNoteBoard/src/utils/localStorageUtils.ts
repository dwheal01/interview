/**
 * Utility functions for localStorage operations
 * Provides consistent error handling and reduces code duplication
 */

/**
 * Safely gets an item from localStorage
 * @param key - Storage key
 * @returns Parsed value or null if not found or invalid
 */
export function getLocalStorageItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to get localStorage item "${key}":`, error);
    return null;
  }
}

/**
 * Safely sets an item in localStorage
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 * @returns true if successful, false otherwise
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Safely gets a string item from localStorage (no JSON parsing)
 * @param key - Storage key
 * @returns String value or null if not found
 */
export function getLocalStorageString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get localStorage string "${key}":`, error);
    return null;
  }
}

/**
 * Safely sets a string item in localStorage (no JSON stringification)
 * @param key - Storage key
 * @param value - String value to store
 * @returns true if successful, false otherwise
 */
export function setLocalStorageString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage string "${key}":`, error);
    return false;
  }
}

/**
 * Safely removes an item from localStorage
 * @param key - Storage key
 */
export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage item "${key}":`, error);
  }
}

