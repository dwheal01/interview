import { useEffect, useState, useRef } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { NoteDoc } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { LocalStorageAdapter } from '../services/storageAdapter';

/**
 * Hook to subscribe to notes from Firestore
 * Falls back to localStorage if Firebase is not enabled
 */
export function useNotesSubscription() {
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const localStorageAdapterRef = useRef(new LocalStorageAdapter());

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;

      const q = query(collection(db, 'workspaces', WORKSPACE_ID, 'notes'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const notesList: NoteDoc[] = [];
          snapshot.forEach((docSnap) => {
            notesList.push(docSnap.data() as NoteDoc);
          });
          setNotes(notesList);
          // Also persist to localStorage as backup
          localStorageAdapterRef.current.saveNotes(notesList).catch((e) => {
            console.error('Failed to backup to localStorage:', e);
          });
        },
        (error) => {
          console.error('Firestore error:', error);
          // Fallback to localStorage on error
          localStorageAdapterRef.current
            .getNotes()
            .then((stored) => setNotes(stored))
            .catch((e) => {
              console.error('Failed to load from localStorage:', e);
            });
        }
      );

      return unsub;
    } else {
      // Fallback to localStorage
      localStorageAdapterRef.current
        .getNotes()
        .then((stored) => setNotes(stored))
        .catch((e) => {
          console.error('Failed to load from localStorage:', e);
        });
    }
  }, []);

  // Persist to localStorage whenever notes change (for localStorage mode)
  useEffect(() => {
    if (!isFirebaseEnabled() && notes.length >= 0) {
      localStorageAdapterRef.current.saveNotes(notes).catch((e) => {
        console.error('Failed to save to localStorage:', e);
      });
    }
  }, [notes]);

  return notes;
}

