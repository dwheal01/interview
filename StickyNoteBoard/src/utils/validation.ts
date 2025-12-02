import { z } from 'zod';
import type { NoteDoc, LockDoc, PresenceDoc, CursorDoc } from '../types';

/**
 * Runtime validation schemas for Firestore documents
 * Ensures type safety and prevents crashes from invalid data
 */

// NoteColor enum validation
const noteColorSchema = z.enum(['yellow', 'pink', 'blue', 'green']);

// NoteDoc schema
export const noteDocSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  content: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
  color: noteColorSchema,
  zIndex: z.number().int().min(0),
  updatedAt: z.number().int().positive(),
});

// LockDoc schema
export const lockDocSchema = z.object({
  noteId: z.string().min(1),
  userId: z.string().min(1),
  username: z.string().min(1),
  userColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Hex color format
  lockedAt: z.number().int().positive(),
});

// PresenceDoc schema
export const presenceDocSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Hex color format
  lastSeen: z.number().int().positive(),
});

// CursorDoc schema
export const cursorDocSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Hex color format
  canvasX: z.number().finite(),
  canvasY: z.number().finite(),
  lastMovedAt: z.number().int().positive(),
});

/**
 * Validates and parses a NoteDoc from unknown data
 * Returns null if validation fails
 */
export function validateNoteDoc(data: unknown): NoteDoc | null {
  try {
    return noteDocSchema.parse(data) as NoteDoc;
  } catch (error) {
    console.error('Invalid NoteDoc data:', error, data);
    return null;
  }
}

/**
 * Validates and parses a LockDoc from unknown data
 * Returns null if validation fails
 */
export function validateLockDoc(data: unknown): LockDoc | null {
  try {
    return lockDocSchema.parse(data) as LockDoc;
  } catch (error) {
    console.error('Invalid LockDoc data:', error, data);
    return null;
  }
}

/**
 * Validates and parses a PresenceDoc from unknown data
 * Returns null if validation fails
 */
export function validatePresenceDoc(data: unknown): PresenceDoc | null {
  try {
    return presenceDocSchema.parse(data) as PresenceDoc;
  } catch (error) {
    console.error('Invalid PresenceDoc data:', error, data);
    return null;
  }
}

/**
 * Validates and parses a CursorDoc from unknown data
 * Returns null if validation fails
 */
export function validateCursorDoc(data: unknown): CursorDoc | null {
  try {
    return cursorDocSchema.parse(data) as CursorDoc;
  } catch (error) {
    console.error('Invalid CursorDoc data:', error, data);
    return null;
  }
}

/**
 * Validates an array of NoteDoc from localStorage JSON
 * Filters out invalid entries and logs warnings
 */
export function validateNoteDocArray(data: unknown): NoteDoc[] {
  if (!Array.isArray(data)) {
    console.error('Expected array of notes, got:', typeof data);
    return [];
  }

  const validNotes: NoteDoc[] = [];
  for (const item of data) {
    const validated = validateNoteDoc(item);
    if (validated) {
      validNotes.push(validated);
    }
  }

  if (validNotes.length !== data.length) {
    console.warn(`Filtered out ${data.length - validNotes.length} invalid notes from localStorage`);
  }

  return validNotes;
}

/**
 * Safe DOM element query with type guard
 * Returns null if element not found or not an HTMLElement
 */
export function queryElementSafe(selector: string): HTMLElement | null {
  const element = document.querySelector(selector);
  if (element instanceof HTMLElement) {
    return element;
  }
  return null;
}

