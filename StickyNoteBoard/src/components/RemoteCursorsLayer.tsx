import type { CursorDoc } from '../types';
import type { CanvasTransform } from '../types';
import { CURSOR_TIMEOUT_MS, CURSOR_SIZE, CURSOR_LABEL_MARGIN_LEFT, CURSOR_LABEL_MARGIN_TOP, CURSOR_LABEL_FONT_SIZE } from '../constants';

type RemoteCursorsLayerProps = {
  cursors: CursorDoc[];
  canvas?: CanvasTransform; // Not used but kept for potential future use
};

export function RemoteCursorsLayer({ cursors }: RemoteCursorsLayerProps) {
  const now = Date.now();
  const activeCursors = cursors.filter(
    cursor => now - cursor.lastMovedAt < CURSOR_TIMEOUT_MS
  );

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

