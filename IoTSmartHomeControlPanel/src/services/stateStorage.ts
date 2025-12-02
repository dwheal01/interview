// State storage service - simulates database persistence
// Can be easily replaced with API calls in the future

import type { DevicesState } from '../context/DeviceContext';

const STORAGE_KEY = 'smart-home-devices-state';
const ROOMS_DATA_KEY = 'smart-home-rooms-data';

// Load persisted state from localStorage
export const loadPersistedState = (): DevicesState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DevicesState;
    }
  } catch (error) {
    console.error('Error loading persisted state:', error);
  }
  return null;
};

// Save state to localStorage (simulating database save)
export const savePersistedState = (state: DevicesState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // In a real app, this would be an API call:
    // await fetch('/api/devices/state', { method: 'POST', body: JSON.stringify(state) });
  } catch (error) {
    console.error('Error saving persisted state:', error);
  }
};

// Load rooms configuration (from JSON or localStorage cache)
export const loadRoomsConfig = async (): Promise<{
  rooms: Array<{ id: string; name: string; devices: string[] }>;
  defaults?: any;
}> => {
  try {
    // Always load fresh from JSON file (cache can be stale)
    // In production, you might want to add a version/timestamp check
    const response = await fetch('/rooms.json');
    if (!response.ok) {
      throw new Error('Failed to load rooms data');
    }
    const data = await response.json();
    
    // Cache it for future use
    localStorage.setItem(ROOMS_DATA_KEY, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Error loading rooms config:', error);
    // Fallback to cache if fetch fails
    const cached = localStorage.getItem(ROOMS_DATA_KEY);
    if (cached) {
      console.warn('Using cached rooms data due to fetch error');
      return JSON.parse(cached);
    }
    throw error;
  }
};

// Clear persisted state (useful for testing or logout)
export const clearPersistedState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ROOMS_DATA_KEY);
};

