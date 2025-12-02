import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { NoteDoc } from '../types';
import { getDb, WORKSPACE_ID } from '../config/firebase';
import type { StorageAdapter } from './storageAdapter';

/**
 * Firestore implementation of StorageAdapter
 */
export class FirestoreAdapter implements StorageAdapter {
  async getNotes(): Promise<NoteDoc[]> {
    // Notes are retrieved via subscriptions, not direct reads
    // This method exists for interface compatibility
    return [];
  }

  async saveNotes(_notes: NoteDoc[]): Promise<void> {
    // Notes are saved individually, not as a batch
    // This method exists for interface compatibility
  }

  async createNote(note: NoteDoc): Promise<void> {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');

    try {
      await setDoc(doc(db, 'workspaces', WORKSPACE_ID, 'notes', note.id), note);
    } catch (error) {
      console.error('Failed to create note in Firestore:', error);
      throw error;
    }
  }

  async updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<void> {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');

    try {
      await updateDoc(doc(db, 'workspaces', WORKSPACE_ID, 'notes', noteId), {
        ...fields,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to update note in Firestore:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');

    try {
      await deleteDoc(doc(db, 'workspaces', WORKSPACE_ID, 'notes', noteId));
      // Clean up lock if exists
      await deleteDoc(doc(db, 'workspaces', WORKSPACE_ID, 'locks', noteId)).catch(() => {});
    } catch (error) {
      console.error('Failed to delete note in Firestore:', error);
      throw error;
    }
  }
}

