import type { NoteDoc } from '../types';
import { validateNoteDocArray } from '../utils/validation';

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
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      // Validate and filter invalid notes
      return validateNoteDocArray(parsed);
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return [];
    }
  }

  async saveNotes(notes: NoteDoc[]): Promise<void> {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
      throw error;
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

