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
import { db, WORKSPACE_ID } from '../config/firebase';
import type { NoteDoc, LockDoc, PresenceDoc, CursorDoc, LocalUser } from '../types';

const HEARTBEAT_MS = 15_000;

// Subscribe to notes
export function useNotes() {
  const [notes, setNotes] = useState<NoteDoc[]>([]);

  useEffect(() => {
    const q = query(collection(db, "workspaces", WORKSPACE_ID, "notes"));
    const unsub = onSnapshot(q, (snapshot) => {
      const notesList: NoteDoc[] = [];
      snapshot.forEach((docSnap) => {
        notesList.push(docSnap.data() as NoteDoc);
      });
      setNotes(notesList);
    });

    return unsub;
  }, []);

  return notes;
}

// Subscribe to locks
export function useLocks() {
  const [locks, setLocks] = useState<Record<string, LockDoc>>({});

  useEffect(() => {
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
  }, []);

  return locks;
}

// Subscribe to presence
export function usePresence() {
  const [presence, setPresence] = useState<PresenceDoc[]>([]);

  useEffect(() => {
    const q = query(collection(db, "workspaces", WORKSPACE_ID, "presence"));
    const unsub = onSnapshot(q, (snapshot) => {
      const presenceList: PresenceDoc[] = [];
      snapshot.forEach((docSnap) => {
        presenceList.push(docSnap.data() as PresenceDoc);
      });
      setPresence(presenceList);
    });

    return unsub;
  }, []);

  return presence;
}

// Subscribe to cursors
export function useCursors(localUserId: string) {
  const [cursors, setCursors] = useState<CursorDoc[]>([]);

  useEffect(() => {
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
  }, [localUserId]);

  return cursors;
}

// Presence heartbeat
export function usePresenceHeartbeat(localUser: LocalUser | null) {
  useEffect(() => {
    if (!localUser) return;

    const updatePresence = async () => {
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
    };

    // Initial update
    updatePresence();

    // Heartbeat interval
    const interval = setInterval(updatePresence, HEARTBEAT_MS);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (localUser) {
        deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "presence", localUser.userId));
      }
    };
  }, [localUser]);
}

// Note operations
export async function createNote(note: NoteDoc) {
  await setDoc(
    doc(db, "workspaces", WORKSPACE_ID, "notes", note.id),
    note
  );
}

export async function updateNote(noteId: string, fields: Partial<NoteDoc>) {
  await updateDoc(
    doc(db, "workspaces", WORKSPACE_ID, "notes", noteId),
    {
      ...fields,
      updatedAt: Date.now(),
    }
  );
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "notes", noteId));
  // Clean up lock if exists
  await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "locks", noteId)).catch(() => {});
}

// Lock operations
export async function acquireLock(noteId: string, localUser: LocalUser) {
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
}

export async function releaseLock(noteId: string) {
  await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "locks", noteId));
}

// Cursor operations
let cursorUpdateThrottle: NodeJS.Timeout | null = null;

export async function updateCursor(canvasX: number, canvasY: number, localUser: LocalUser) {
  if (cursorUpdateThrottle) return;
  
  cursorUpdateThrottle = setTimeout(() => {
    cursorUpdateThrottle = null;
  }, 100);

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
}

