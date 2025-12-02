import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import type { NoteDoc, LockDoc, PresenceDoc, CursorDoc, LocalUser } from '../types';

const HEARTBEAT_MS = 15_000;
const NOTES_STORAGE_KEY = "sticky-board-notes";

// Subscribe to notes
export function useNotes() {
  const [notes, setNotes] = useState<NoteDoc[]>([]);

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;
      
      const q = query(collection(db, "workspaces", WORKSPACE_ID, "notes"));
      const unsub = onSnapshot(q, (snapshot) => {
        const notesList: NoteDoc[] = [];
        snapshot.forEach((docSnap) => {
          notesList.push(docSnap.data() as NoteDoc);
        });
        setNotes(notesList);
        // Also persist to localStorage as backup
        try {
          localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesList));
        } catch (e) {
          console.error('Failed to backup to localStorage:', e);
        }
      }, (error) => {
        console.error('Firestore error:', error);
        // Fallback to localStorage on error
        try {
          const stored = localStorage.getItem(NOTES_STORAGE_KEY);
          if (stored) {
            setNotes(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Failed to load from localStorage:', e);
        }
      });

      return unsub;
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(NOTES_STORAGE_KEY);
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    }
  }, []);

  // Persist to localStorage whenever notes change (for localStorage mode)
  useEffect(() => {
    if (!isFirebaseEnabled() && notes.length >= 0) {
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [notes]);

  return notes;
}

// Subscribe to locks
export function useLocks() {
  const [locks, setLocks] = useState<Record<string, LockDoc>>({});

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;
      
      const q = query(collection(db, "workspaces", WORKSPACE_ID, "locks"));
      const unsub = onSnapshot(q, (snapshot) => {
        const locksMap: Record<string, LockDoc> = {};
        snapshot.forEach((docSnap) => {
          const lock = docSnap.data() as LockDoc;
          locksMap[lock.noteId] = lock;
        });
        setLocks(locksMap);
      });

      return unsub;
    }
    // No locks in localStorage mode (single-user)
  }, []);

  return locks;
}

// Subscribe to presence
export function usePresence() {
  const [presence, setPresence] = useState<PresenceDoc[]>([]);

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;
      
      const q = query(collection(db, "workspaces", WORKSPACE_ID, "presence"));
      const unsub = onSnapshot(q, (snapshot) => {
        const presenceList: PresenceDoc[] = [];
        snapshot.forEach((docSnap) => {
          presenceList.push(docSnap.data() as PresenceDoc);
        });
        setPresence(presenceList);
      });

      return unsub;
    }
    // No presence in localStorage mode (single-user)
  }, []);

  return presence;
}

// Subscribe to cursors
export function useCursors(localUserId: string) {
  const [cursors, setCursors] = useState<CursorDoc[]>([]);

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;
      
      const q = query(collection(db, "workspaces", WORKSPACE_ID, "cursors"));
      const unsub = onSnapshot(q, (snapshot) => {
        const cursorsList: CursorDoc[] = [];
        snapshot.forEach((docSnap) => {
          const cursor = docSnap.data() as CursorDoc;
          // Filter out local user's cursor
          if (cursor.userId !== localUserId) {
            cursorsList.push(cursor);
          }
        });
        setCursors(cursorsList);
      });

      return unsub;
    }
    // No cursors in localStorage mode (single-user)
  }, [localUserId]);

  return cursors;
}

// Presence heartbeat
export function usePresenceHeartbeat(localUser: LocalUser | null) {
  useEffect(() => {
    if (!localUser || !isFirebaseEnabled()) return;

    const db = getDb();
    if (!db) return;

    const updatePresence = async () => {
      try {
        await setDoc(
          doc(db, "workspaces", WORKSPACE_ID, "presence", localUser.userId),
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
      }
    };

    // Initial update
    updatePresence();

    // Heartbeat interval
    const interval = setInterval(updatePresence, HEARTBEAT_MS);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (localUser && db) {
        deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "presence", localUser.userId)).catch(() => {});
      }
    };
  }, [localUser]);
}

// Note operations
export async function createNote(note: NoteDoc) {
  if (isFirebaseEnabled()) {
    const db = getDb();
    if (db) {
      try {
        await setDoc(
          doc(db, "workspaces", WORKSPACE_ID, "notes", note.id),
          note
        );
        return;
      } catch (error) {
        console.error('Failed to create note in Firestore:', error);
      }
    }
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    const notes: NoteDoc[] = stored ? JSON.parse(stored) : [];
    notes.push(note);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save note to localStorage:', error);
  }
}

export async function updateNote(noteId: string, fields: Partial<NoteDoc>) {
  if (isFirebaseEnabled()) {
    const db = getDb();
    if (db) {
      try {
        await updateDoc(
          doc(db, "workspaces", WORKSPACE_ID, "notes", noteId),
          {
            ...fields,
            updatedAt: Date.now(),
          }
        );
        return;
      } catch (error) {
        console.error('Failed to update note in Firestore:', error);
      }
    }
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    const notes: NoteDoc[] = stored ? JSON.parse(stored) : [];
    const index = notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...fields, updatedAt: Date.now() };
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    }
  } catch (error) {
    console.error('Failed to update note in localStorage:', error);
  }
}

export async function deleteNote(noteId: string) {
  if (isFirebaseEnabled()) {
    const db = getDb();
    if (db) {
      try {
        await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "notes", noteId));
        // Clean up lock if exists
        await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "locks", noteId)).catch(() => {});
        return;
      } catch (error) {
        console.error('Failed to delete note in Firestore:', error);
      }
    }
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    const notes: NoteDoc[] = stored ? JSON.parse(stored) : [];
    const filtered = notes.filter(n => n.id !== noteId);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete note from localStorage:', error);
  }
}

// Lock operations
export async function acquireLock(noteId: string, localUser: LocalUser) {
  if (!isFirebaseEnabled()) return; // No locks in localStorage mode
  
  const db = getDb();
  if (!db) return;
  
  try {
    await setDoc(
      doc(db, "workspaces", WORKSPACE_ID, "locks", noteId),
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
  }
}

export async function releaseLock(noteId: string) {
  if (!isFirebaseEnabled()) return; // No locks in localStorage mode
  
  const db = getDb();
  if (!db) return;
  
  try {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "locks", noteId));
  } catch (error) {
    console.error('Failed to release lock:', error);
  }
}

// Cursor operations
let cursorUpdateThrottle: ReturnType<typeof setTimeout> | null = null;

export async function updateCursor(canvasX: number, canvasY: number, localUser: LocalUser) {
  if (!isFirebaseEnabled()) return; // No cursors in localStorage mode
  
  if (cursorUpdateThrottle) return;
  
  cursorUpdateThrottle = setTimeout(() => {
    cursorUpdateThrottle = null;
  }, 100);

  const db = getDb();
  if (!db) return;

  try {
    await setDoc(
      doc(db, "workspaces", WORKSPACE_ID, "cursors", localUser.userId),
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
  }
}

