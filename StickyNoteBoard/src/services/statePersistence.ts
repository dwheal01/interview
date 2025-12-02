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
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CANVAS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          canvas: parsed.canvas || undefined,
          nextZIndex: parsed.nextZIndex || 1,
        };
      }
    } catch (error) {
      console.error('Failed to load canvas from localStorage:', error);
    }
    return null;
  },

  /**
   * Save canvas state to localStorage
   */
  saveCanvas(canvas: PersistedState['canvas'], nextZIndex: number): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CANVAS,
        JSON.stringify({ canvas, nextZIndex })
      );
    } catch (error) {
      console.error('Failed to save canvas to localStorage:', error);
    }
  },

  /**
   * Load user session from localStorage
   */
  loadUserSession(): {
    userId: string;
    username: string;
    color: string;
  } | null {
    try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
      const color = localStorage.getItem(STORAGE_KEYS.USER_COLOR);

      if (userId && username && color) {
        return { userId, username, color };
      }
    } catch (error) {
      console.error('Failed to load user session from localStorage:', error);
    }
    return null;
  },

  /**
   * Save user session to localStorage
   */
  saveUserSession(userId: string, username: string, color: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, userId);
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
      localStorage.setItem(STORAGE_KEYS.USER_COLOR, color);
    } catch (error) {
      console.error('Failed to save user session to localStorage:', error);
    }
  },

  /**
   * Clear all persisted state (useful for testing or logout)
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

