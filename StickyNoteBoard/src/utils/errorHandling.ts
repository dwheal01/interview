/**
 * Error handling utilities
 * Provides consistent error handling patterns across the application
 */

export type ErrorResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error; message: string };

/**
 * Wraps an async function to return a Result type instead of throwing
 * @param fn - Async function to wrap
 * @returns Promise that resolves to Result type
 */
export async function toResult<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<ErrorResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err,
      message: errorMessage || err.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Wraps a synchronous function to return a Result type instead of throwing
 * @param fn - Synchronous function to wrap
 * @returns Result type
 */
export function toResultSync<T>(
  fn: () => T,
  errorMessage?: string
): ErrorResult<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err,
      message: errorMessage || err.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError'
    );
  }
  return false;
}

/**
 * Checks if an error is a Firestore error
 */
export function isFirestoreError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'FirebaseError' ||
      error.message.includes('firestore') ||
      error.message.includes('Firestore')
    );
  }
  return false;
}

/**
 * Gets a user-friendly error message from an error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return 'Network error. Please check your connection and try again.';
    }
    if (isFirestoreError(error)) {
      return 'Failed to sync with server. Your changes are saved locally.';
    }
    return error.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

/**
 * Logs an error with context
 */
export function logError(error: unknown, context?: string): void {
  const message = context ? `[${context}]` : '';
  console.error(`${message} Error:`, error);
  
  if (error instanceof Error) {
    console.error('Error stack:', error.stack);
  }
}

