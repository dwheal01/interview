import { doc, setDoc, updateDoc, deleteDoc, type Firestore } from 'firebase/firestore';
import type { NoteDoc, LocalUser } from '../types';
import type { FirestoreService } from './firestoreService';

/**
 * Default implementation of FirestoreService
 * Uses Firebase directly (for production use)
 */
export class FirestoreServiceImpl implements FirestoreService {
  private db: Firestore | null;
  private workspaceId: string;
  private enabled: boolean;

  constructor(db: Firestore | null, workspaceId: string, enabled: boolean) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.enabled = enabled;
  }

  getDb(): Firestore | null {
    return this.db;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getWorkspaceId(): string {
    return this.workspaceId;
  }

  async createNote(note: NoteDoc): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    try {
      await setDoc(doc(this.db, 'workspaces', this.workspaceId, 'notes', note.id), note);
    } catch (error) {
      console.error('Failed to create note in Firestore:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    try {
      await updateDoc(doc(this.db, 'workspaces', this.workspaceId, 'notes', noteId), {
        ...fields,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to update note in Firestore:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    try {
      await deleteDoc(doc(this.db, 'workspaces', this.workspaceId, 'notes', noteId));
      // Clean up lock if exists
      await deleteDoc(doc(this.db, 'workspaces', this.workspaceId, 'locks', noteId)).catch(() => {});
    } catch (error) {
      console.error('Failed to delete note in Firestore:', error);
      throw error;
    }
  }

  async acquireLock(noteId: string, localUser: LocalUser): Promise<void> {
    if (!this.enabled || !this.db) return;

    try {
      await setDoc(
        doc(this.db, 'workspaces', this.workspaceId, 'locks', noteId),
        {
          noteId,
          userId: localUser.userId,
          username: localUser.username,
          userColor: localUser.color,
          lockedAt: Date.now(),
        }
      );
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      throw error;
    }
  }

  async releaseLock(noteId: string): Promise<void> {
    if (!this.enabled || !this.db) return;

    try {
      await deleteDoc(doc(this.db, 'workspaces', this.workspaceId, 'locks', noteId));
    } catch (error) {
      console.error('Failed to release lock:', error);
      throw error;
    }
  }

  async updatePresence(localUser: LocalUser): Promise<void> {
    if (!this.enabled || !this.db) return;

    try {
      await setDoc(
        doc(this.db, 'workspaces', this.workspaceId, 'presence', localUser.userId),
        {
          userId: localUser.userId,
          username: localUser.username,
          color: localUser.color,
          lastSeen: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update presence:', error);
      throw error;
    }
  }

  async removePresence(userId: string): Promise<void> {
    if (!this.enabled || !this.db) return;

    try {
      await deleteDoc(doc(this.db, 'workspaces', this.workspaceId, 'presence', userId));
    } catch (error) {
      console.error('Failed to remove presence:', error);
      // Don't throw - cleanup failures are non-critical
    }
  }

  async updateCursor(canvasX: number, canvasY: number, localUser: LocalUser): Promise<void> {
    if (!this.enabled || !this.db) return;

    try {
      await setDoc(
        doc(this.db, 'workspaces', this.workspaceId, 'cursors', localUser.userId),
        {
          userId: localUser.userId,
          username: localUser.username,
          color: localUser.color,
          canvasX,
          canvasY,
          lastMovedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update cursor:', error);
      // Don't throw - cursor updates are non-critical
    }
  }
}

