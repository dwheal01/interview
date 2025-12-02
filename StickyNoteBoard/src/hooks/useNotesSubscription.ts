import { useEffect, useState, useRef } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { NoteDoc } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { LocalStorageAdapter } from '../services/storageAdapter';
import { useErrorNotification } from '../context/ErrorNotificationContext';
import { validateNoteDoc, validateNoteDocArray } from '../utils/validation';

/**
 * Hook to subscribe to notes from Firestore
 * Falls back to localStorage if Firebase is not enabled
 */
export function useNotesSubscription() {
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const localStorageAdapterRef = useRef(new LocalStorageAdapter());
  const { showError } = useErrorNotification();

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
            const validated = validateNoteDoc(docSnap.data());
            if (validated) {
              notesList.push(validated);
            }
          });
          setNotes(notesList);
          // Also persist to localStorage as backup
          localStorageAdapterRef.current.saveNotes(notesList).catch((e) => {
            console.error('Failed to backup to localStorage:', e);
          });
        },
        (error) => {
          console.error('Firestore error:', error);
          showError('Connection lost. Loading notes from local storage.', 'warning');
          // Fallback to localStorage on error
          localStorageAdapterRef.current
            .getNotes()
            .then((stored) => {
              const validated = validateNoteDocArray(stored);
              setNotes(validated);
            })
            .catch((e) => {
              console.error('Failed to load from localStorage:', e);
              showError('Failed to load notes from local storage.', 'error');
            });
        }
      );

      return unsub;
    } else {
      // Fallback to localStorage
      localStorageAdapterRef.current
        .getNotes()
        .then((stored) => {
          const validated = validateNoteDocArray(stored);
          setNotes(validated);
        })
        .catch((e) => {
          console.error('Failed to load from localStorage:', e);
          showError('Failed to load notes from local storage.', 'error');
        });
    }
  }, [showError]);

  // Persist to localStorage whenever notes change (for localStorage mode)
  useEffect(() => {
    if (!isFirebaseEnabled() && notes.length >= 0) {
      localStorageAdapterRef.current.saveNotes(notes).catch((e) => {
        console.error('Failed to save to localStorage:', e);
        showError('Failed to save notes to local storage.', 'error');
      });
    }
  }, [notes, showError]);

  return notes;
}

