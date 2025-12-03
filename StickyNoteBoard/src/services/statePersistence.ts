import { getLocalStorageItem, setLocalStorageItem, getLocalStorageString, setLocalStorageString, removeLocalStorageItem } from '../utils/localStorageUtils';

/**
 * Unified state persistence service
 * Centralizes all localStorage operations for consistent data flow
 */

export interface PersistedState {
  canvas?: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };
  nextZIndex?: number;
  activeColor?: 'yellow' | 'pink' | 'blue' | 'green';
  // Add other persisted state here as needed
}

const STORAGE_KEYS = {
  CANVAS: 'sticky-board-canvas',
  USER_SESSION: 'sticky-user-id', // Legacy key, kept for compatibility
  USERNAME: 'sticky-username',
  USER_COLOR: 'sticky-user-color',
} as const;

/**
 * State persistence service
 * Provides a single interface for all localStorage operations
 */
export const statePersistence = {
  /**
   * Load canvas state from localStorage
   */
  loadCanvas(): { canvas: PersistedState['canvas']; nextZIndex: number } | null {
    const parsed = getLocalStorageItem<{ canvas?: PersistedState['canvas']; nextZIndex?: number }>(STORAGE_KEYS.CANVAS);
    if (parsed) {
      return {
        canvas: parsed.canvas || undefined,
        nextZIndex: parsed.nextZIndex || 1,
      };
    }
    return null;
  },

  /**
   * Save canvas state to localStorage
   */
  saveCanvas(canvas: PersistedState['canvas'], nextZIndex: number): void {
    setLocalStorageItem(STORAGE_KEYS.CANVAS, { canvas, nextZIndex });
  },

  /**
   * Load user session from localStorage
   */
  loadUserSession(): {
    userId: string;
    username: string;
    color: string;
  } | null {
    const userId = getLocalStorageString(STORAGE_KEYS.USER_SESSION);
    const username = getLocalStorageString(STORAGE_KEYS.USERNAME);
    const color = getLocalStorageString(STORAGE_KEYS.USER_COLOR);

    if (userId && username && color) {
      return { userId, username, color };
    }
    return null;
  },

  /**
   * Save user session to localStorage
   */
  saveUserSession(userId: string, username: string, color: string): void {
    setLocalStorageString(STORAGE_KEYS.USER_SESSION, userId);
    setLocalStorageString(STORAGE_KEYS.USERNAME, username);
    setLocalStorageString(STORAGE_KEYS.USER_COLOR, color);
  },

  /**
   * Clear all persisted state (useful for testing or logout)
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      removeLocalStorageItem(key);
    });
  },
};

