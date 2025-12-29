import type { Book } from '../types/book';

const FAVORITES_STORAGE_KEY = 'library-favorites';

export function getFavorites(): Book[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
}

export function saveFavorites(favorites: Book[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

export function addFavorite(book: Book): void {
  const favorites = getFavorites();
  favorites.push(book);
  saveFavorites(favorites);
}

export function removeFavorite(bookKey: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.key !== bookKey);
  saveFavorites(filtered);
}

export function isFavorite(bookKey: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.key === bookKey);
}

