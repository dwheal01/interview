import type { CursorDoc } from '../types';
import type { CanvasTransform } from '../types';

type RemoteCursorsLayerProps = {
  cursors: CursorDoc[];
  canvas?: CanvasTransform; // Not used but kept for potential future use
};

const CURSOR_TIMEOUT_MS = 10_000;

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
              className="w-3 h-3 rounded-full border border-white shadow"
              style={{ backgroundColor: cursor.color }}
            />
            <div className="ml-4 -mt-3 px-1 rounded text-[10px] bg-white/80 text-gray-800">
              {cursor.username}
            </div>
          </div>
        );
      })}
    </>
  );
}

