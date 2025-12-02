import type { NoteDoc } from '../types';
import { isFirebaseEnabled } from '../config/firebase';
import { FirestoreAdapter } from './firestoreAdapter';
import { LocalStorageAdapter, type StorageAdapter } from './storageAdapter';
import { toResult, logError, isNetworkError } from '../utils/errorHandling';
import type { ErrorResult } from '../utils/errorHandling';

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
 * Returns Result types for consistent error handling
 */
export const noteService = {
  /**
   * Create a note
   * @returns Result type - check success property before using data
   */
  async createNote(note: NoteDoc): Promise<ErrorResult<void>> {
    const adapter = getStorageAdapter();
    const result = await toResult(
      () => adapter.createNote(note),
      'Failed to create note'
    );

    // If Firestore fails and we're using Firebase, try localStorage fallback
    if (!result.success && isFirebaseEnabled() && isNetworkError(result.error)) {
      logError(result.error, 'noteService.createNote');
      const fallbackResult = await toResult(
        () => new LocalStorageAdapter().createNote(note),
        'Failed to save note locally'
      );
      
      if (fallbackResult.success) {
        return {
          success: false,
          error: result.error,
          message: 'Note saved locally. Sync will retry when connection is restored.',
        };
      }
    }

    return result;
  },

  /**
   * Update a note
   * @returns Result type - check success property before using data
   */
  async updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<ErrorResult<void>> {
    const adapter = getStorageAdapter();
    const result = await toResult(
      () => adapter.updateNote(noteId, fields),
      'Failed to update note'
    );

    // If Firestore fails and we're using Firebase, try localStorage fallback
    if (!result.success && isFirebaseEnabled() && isNetworkError(result.error)) {
      logError(result.error, 'noteService.updateNote');
      const fallbackResult = await toResult(
        () => new LocalStorageAdapter().updateNote(noteId, fields),
        'Failed to update note locally'
      );
      
      if (fallbackResult.success) {
        return {
          success: false,
          error: result.error,
          message: 'Note updated locally. Sync will retry when connection is restored.',
        };
      }
    }

    return result;
  },

  /**
   * Delete a note
   * @returns Result type - check success property before using data
   */
  async deleteNote(noteId: string): Promise<ErrorResult<void>> {
    const adapter = getStorageAdapter();
    const result = await toResult(
      () => adapter.deleteNote(noteId),
      'Failed to delete note'
    );

    // If Firestore fails and we're using Firebase, try localStorage fallback
    if (!result.success && isFirebaseEnabled() && isNetworkError(result.error)) {
      logError(result.error, 'noteService.deleteNote');
      const fallbackResult = await toResult(
        () => new LocalStorageAdapter().deleteNote(noteId),
        'Failed to delete note locally'
      );
      
      if (fallbackResult.success) {
        return {
          success: false,
          error: result.error,
          message: 'Note deleted locally. Sync will retry when connection is restored.',
        };
      }
    }

    return result;
  },
};

