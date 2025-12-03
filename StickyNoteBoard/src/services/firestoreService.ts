import type { Firestore } from 'firebase/firestore';
import type { NoteDoc, LocalUser } from '../types';

/**
 * Firestore service interface for dependency injection
 * Abstracts Firestore operations to allow testing and swapping implementations
 */
export interface FirestoreService {
  /**
   * Get the Firestore database instance
   */
  getDb(): Firestore | null;

  /**
   * Check if Firebase is enabled
   */
  isEnabled(): boolean;

  /**
   * Get the workspace ID
   */
  getWorkspaceId(): string;

  /**
   * Create a note document
   */
  createNote(note: NoteDoc): Promise<void>;

  /**
   * Update a note document
   */
  updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<void>;

  /**
   * Delete a note document
   */
  deleteNote(noteId: string): Promise<void>;

  /**
   * Acquire a lock on a note
   */
  acquireLock(noteId: string, localUser: LocalUser): Promise<void>;

  /**
   * Release a lock on a note
   */
  releaseLock(noteId: string): Promise<void>;

  /**
   * Update user presence
   */
  updatePresence(localUser: LocalUser): Promise<void>;

  /**
   * Remove user presence
   */
  removePresence(userId: string): Promise<void>;

  /**
   * Update cursor position
   */
  updateCursor(canvasX: number, canvasY: number, localUser: LocalUser): Promise<void>;
}

