import type { NoteDoc } from '../types';
import { isFirebaseEnabled } from '../config/firebase';
import { FirestoreAdapter } from './firestoreAdapter';
import { LocalStorageAdapter, type StorageAdapter } from './storageAdapter';

// Get the appropriate storage adapter
function getStorageAdapter(): StorageAdapter {
  if (isFirebaseEnabled()) {
    return new FirestoreAdapter();
  }
  return new LocalStorageAdapter();
}

/**
 * Service for note CRUD operations
 * Abstracts storage implementation (Firestore vs localStorage)
 */
export const noteService = {
  async createNote(note: NoteDoc): Promise<void> {
    const adapter = getStorageAdapter();
    try {
      await adapter.createNote(note);
    } catch (error) {
      // Fallback to localStorage if Firestore fails
      if (isFirebaseEnabled()) {
        console.error('Firestore failed, falling back to localStorage:', error);
        const fallbackAdapter = new LocalStorageAdapter();
        await fallbackAdapter.createNote(note);
      } else {
        throw error;
      }
    }
  },

  async updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<void> {
    const adapter = getStorageAdapter();
    try {
      await adapter.updateNote(noteId, fields);
    } catch (error) {
      // Fallback to localStorage if Firestore fails
      if (isFirebaseEnabled()) {
        console.error('Firestore failed, falling back to localStorage:', error);
        const fallbackAdapter = new LocalStorageAdapter();
        await fallbackAdapter.updateNote(noteId, fields);
      } else {
        throw error;
      }
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    const adapter = getStorageAdapter();
    try {
      await adapter.deleteNote(noteId);
    } catch (error) {
      // Fallback to localStorage if Firestore fails
      if (isFirebaseEnabled()) {
        console.error('Firestore failed, falling back to localStorage:', error);
        const fallbackAdapter = new LocalStorageAdapter();
        await fallbackAdapter.deleteNote(noteId);
      } else {
        throw error;
      }
    }
  },
};

