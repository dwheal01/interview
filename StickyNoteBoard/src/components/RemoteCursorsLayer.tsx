import { useMemo, memo, useState, useEffect } from 'react';
import type { CursorDoc } from '../types';
import type { CanvasTransform } from '../types';
import { CURSOR_TIMEOUT_MS, CURSOR_SIZE, CURSOR_LABEL_MARGIN_LEFT, CURSOR_LABEL_MARGIN_TOP, CURSOR_LABEL_FONT_SIZE } from '../constants';

type RemoteCursorsLayerProps = {
  cursors: CursorDoc[];
  canvas?: CanvasTransform; // Not used but kept for potential future use
};

const CURSOR_UPDATE_INTERVAL_MS = 1_000; // Update every second for smoother cursor tracking

function RemoteCursorsLayerComponent({ cursors }: RemoteCursorsLayerProps) {
  // Use state to track current time, updated via effect (not during render)
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, CURSOR_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Memoize filtered cursors to avoid recalculating on every render
  const activeCursors = useMemo(() => {
    return cursors.filter(
      cursor => currentTime - cursor.lastMovedAt < CURSOR_TIMEOUT_MS
    );
  }, [cursors, currentTime]);

  return (
    <>
      {activeCursors.map((cursor) => {
        // Cursors are rendered inside the transformed container, so use canvas coordinates directly
        // The parent div already applies the transform (translate + scale)
        // This matches how notes are positioned (they also use canvas coordinates)
        return (
          <div
            key={cursor.userId}
            className="pointer-events-none absolute"
            style={{ left: cursor.canvasX, top: cursor.canvasY }}
          >
            <div
              className="rounded-full border border-white shadow"
              style={{ 
                backgroundColor: cursor.color,
                width: `${CURSOR_SIZE}px`,
                height: `${CURSOR_SIZE}px`,
              }}
            />
            <div 
              className="px-1 rounded bg-white/80 text-gray-800"
              style={{
                marginLeft: `${CURSOR_LABEL_MARGIN_LEFT}px`,
                marginTop: `${CURSOR_LABEL_MARGIN_TOP}px`,
                fontSize: `${CURSOR_LABEL_FONT_SIZE}px`,
              }}
            >
              {cursor.username}
            </div>
          </div>
        );
      })}
    </>
  );
}

// Memoize RemoteCursorsLayer to prevent unnecessary re-renders
export const RemoteCursorsLayer = memo(RemoteCursorsLayerComponent);

