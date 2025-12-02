import { useEffect } from 'react';

/**
 * Custom hook to prevent browser zoom shortcuts (Ctrl/Cmd + +/-/0)
 * This allows the canvas zoom to work without interference from browser zoom
 */
export function useBrowserZoomPrevention() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+' || e.key === '_')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

