import type { NoteDoc } from '../types';
import { validateNoteDocArray } from '../utils/validation';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorageUtils';

const NOTES_STORAGE_KEY = "sticky-board-notes";

/**
 * Storage adapter interface for abstracting storage operations
 * Allows switching between Firestore and localStorage implementations
 */
export interface StorageAdapter {
  getNotes(): Promise<NoteDoc[]>;
  saveNotes(notes: NoteDoc[]): Promise<void>;
  createNote(note: NoteDoc): Promise<void>;
  updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<void>;
  deleteNote(noteId: string): Promise<void>;
}

/**
 * localStorage implementation of StorageAdapter
 */
export class LocalStorageAdapter implements StorageAdapter {
  async getNotes(): Promise<NoteDoc[]> {
    const parsed = getLocalStorageItem<NoteDoc[]>(NOTES_STORAGE_KEY);
    if (!parsed) {
      return [];
    }
    // Validate and filter invalid notes
    return validateNoteDocArray(parsed);
  }

  async saveNotes(notes: NoteDoc[]): Promise<void> {
    const success = setLocalStorageItem(NOTES_STORAGE_KEY, notes);
    if (!success) {
      throw new Error('Failed to save notes to localStorage');
    }
  }

  async createNote(note: NoteDoc): Promise<void> {
    const notes = await this.getNotes();
    notes.push(note);
    await this.saveNotes(notes);
  }

  async updateNote(noteId: string, fields: Partial<NoteDoc>): Promise<void> {
    const notes = await this.getNotes();
    const index = notes.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...fields, updatedAt: Date.now() };
      await this.saveNotes(notes);
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getNotes();
    const filtered = notes.filter((n) => n.id !== noteId);
    await this.saveNotes(filtered);
  }
}

