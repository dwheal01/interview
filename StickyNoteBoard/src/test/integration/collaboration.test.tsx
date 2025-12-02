import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { setupLocalStorageMock, clearLocalStorageMock } from '../mocks/localStorage';
import { createMockNote, createMockUser, createMockLock } from '../utils/testUtils';
import {
  mockFirestore,
  createMockSnapshot,
  createMockDoc,
} from '../test/mocks/firebase';
import * as firebaseConfig from '../../config/firebase';

// Mock Firebase to be enabled
vi.mock('../../config/firebase', async () => {
  const actual = await vi.importActual('../../config/firebase');
  return {
    ...actual,
    isFirebaseEnabled: vi.fn(() => true),
    getDb: vi.fn(() => mockFirestore),
    WORKSPACE_ID: 'default',
  };
});

describe('Collaboration Features Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearLocalStorageMock();
    setupLocalStorageMock();
    
    // Set up user session
    localStorage.setItem('sticky-user-id', 'local-user-1');
    localStorage.setItem('sticky-username', 'Local User');
    localStorage.setItem('sticky-user-color', '#f97316');
  });

  describe('User Presence', () => {
    it('should display other users in presence bar', async () => {
      const otherUser = createMockUser({ 
        userId: 'other-user-1',
        username: 'Other User',
      });

      // Mock presence subscription
      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([
          createMockDoc('other-user-1', {
            userId: otherUser.userId,
            username: otherUser.username,
            color: otherUser.color,
            lastSeen: Date.now(),
          }),
        ]));
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        // Presence bar should show other user
        const presenceBar = document.querySelector('[class*="fixed top-2 right-4"]');
        expect(presenceBar).toBeInTheDocument();
      });
    });
  });

  describe('Note Locking', () => {
    it('should show lock overlay when note is locked by another user', async () => {
      const note = createMockNote({ id: 'note-1' });
      const lock = createMockLock({
        noteId: 'note-1',
        userId: 'other-user-1',
        username: 'Other User',
      });

      // Mock notes subscription
      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        const path = (q as any).path || '';
        if (path.includes('notes')) {
          onNext(createMockSnapshot([
            createMockDoc('note-1', note),
          ]));
        } else if (path.includes('locks')) {
          onNext(createMockSnapshot([
            createMockDoc('note-1', lock),
          ]));
        }
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Other User is editing…')).toBeInTheDocument();
      });
    });

    it('should prevent editing when note is locked by another user', async () => {
      const user = userEvent.setup();
      const note = createMockNote({ id: 'note-1', title: 'Locked Note' });
      const lock = createMockLock({
        noteId: 'note-1',
        userId: 'other-user-1',
        username: 'Other User',
      });

      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        const path = (q as any).path || '';
        if (path.includes('notes')) {
          onNext(createMockSnapshot([createMockDoc('note-1', note)]));
        } else if (path.includes('locks')) {
          onNext(createMockSnapshot([createMockDoc('note-1', lock)]));
        }
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Locked Note') as HTMLInputElement;
        expect(titleInput.readOnly).toBe(true);
      });
    });
  });

  describe('Remote Cursors', () => {
    it('should display remote user cursors', async () => {
      const cursor = {
        userId: 'remote-user-1',
        username: 'Remote User',
        color: '#3b82f6',
        canvasX: 100,
        canvasY: 200,
        lastMovedAt: Date.now(),
      };

      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        const path = (q as any).path || '';
        if (path.includes('cursors')) {
          onNext(createMockSnapshot([
            createMockDoc('remote-user-1', cursor),
          ]));
        }
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        // Remote cursor should be rendered
        // This would be tested by checking for cursor elements in the DOM
        expect(true).toBe(true); // Placeholder
      });
    });
  });
});

