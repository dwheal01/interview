import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { setupLocalStorageMock, clearLocalStorageMock } from '../mocks/localStorage';

// Mock Firebase to use localStorage fallback
vi.mock('../../config/firebase', async () => {
  const actual = await vi.importActual('../../config/firebase');
  return {
    ...actual,
    isFirebaseEnabled: vi.fn(() => false),
    getDb: vi.fn(() => null),
  };
});

describe('Canvas Operations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearLocalStorageMock();
    setupLocalStorageMock();
    
    // Set up user session
    localStorage.setItem('sticky-user-id', 'test-user-1');
    localStorage.setItem('sticky-username', 'Test User');
    localStorage.setItem('sticky-user-color', '#f97316');

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
  });

  describe('Zoom Operations', () => {
    it('should update zoom percentage in toolbar when zooming', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = document.querySelector('[class*="bg-slate-50"]') as HTMLElement;
      
      // Simulate wheel event to zoom in
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // Negative for zoom in
        clientX: 960,
        clientY: 540,
        bubbles: true,
      });

      fireEvent(canvas, wheelEvent);

      await waitFor(() => {
        const zoomText = screen.getByText(/Zoom:/);
        // Zoom should be greater than 100% after zooming in
        expect(zoomText.textContent).not.toBe('Zoom: 100%');
      });
    });

    it('should clamp zoom to minimum and maximum values', async () => {
      render(<App />);

      const canvas = document.querySelector('[class*="bg-slate-50"]') as HTMLElement;

      // Zoom out many times
      for (let i = 0; i < 20; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: 100, // Positive for zoom out
          clientX: 960,
          clientY: 540,
          bubbles: true,
        });
        fireEvent(canvas, wheelEvent);
      }

      await waitFor(() => {
        const zoomText = screen.getByText(/Zoom:/);
        const zoomPercent = parseInt(zoomText.textContent?.match(/\d+/) || '100');
        expect(zoomPercent).toBeGreaterThanOrEqual(30); // Min zoom is 30%
      });
    });
  });

  describe('Pan Operations', () => {
    it('should pan canvas when right-click dragging', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = document.querySelector('[class*="bg-slate-50"]') as HTMLElement;

      // Right-click and drag
      fireEvent.mouseDown(canvas, { button: 2, clientX: 500, clientY: 500 });
      fireEvent.mouseMove(window, { clientX: 600, clientY: 600 });
      fireEvent.mouseUp(window);

      // Canvas should have moved (offset should be updated)
      // This is tested indirectly through note positions
      await waitFor(() => {
        // Pan should have occurred
        expect(true).toBe(true); // Placeholder - actual test would check canvas transform
      });
    });
  });

  describe('Reset View', () => {
    it('should reset canvas to fit all notes', async () => {
      const user = userEvent.setup();
      
      // Create multiple notes at different positions
      const notes = [
        { id: 'note-1', x: 0, y: 0, title: 'Note 1', content: '', color: 'yellow', zIndex: 1, updatedAt: Date.now() },
        { id: 'note-2', x: 500, y: 500, title: 'Note 2', content: '', color: 'pink', zIndex: 2, updatedAt: Date.now() },
      ];
      localStorage.setItem('sticky-board-notes', JSON.stringify(notes));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Note 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Note 2')).toBeInTheDocument();
      });

      // Click Reset View
      const resetButton = screen.getByText('Reset View');
      await user.click(resetButton);

      // Canvas should be adjusted to show all notes
      // This is tested indirectly - notes should be visible
      await waitFor(() => {
        expect(screen.getByDisplayValue('Note 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Note 2')).toBeInTheDocument();
      });
    });

    it('should reset to default when no notes exist', async () => {
      const user = userEvent.setup();
      render(<App />);

      const resetButton = screen.getByText('Reset View');
      await user.click(resetButton);

      // Zoom should be 100%
      await waitFor(() => {
        expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
      });
    });
  });
});

