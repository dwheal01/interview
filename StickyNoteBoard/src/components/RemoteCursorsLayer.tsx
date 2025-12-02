import type { CursorDoc } from '../types';
import type { CanvasTransform } from '../types';

type RemoteCursorsLayerProps = {
  cursors: CursorDoc[];
  canvas: CanvasTransform;
};

const CURSOR_TIMEOUT_MS = 10_000;

export function RemoteCursorsLayer({ cursors, canvas }: RemoteCursorsLayerProps) {
  const now = Date.now();
  const activeCursors = cursors.filter(
    cursor => now - cursor.lastMovedAt < CURSOR_TIMEOUT_MS
  );

  return (
    <>
      {activeCursors.map((cursor) => {
        // Convert canvas coordinates to screen coordinates
        const screenX = canvas.offsetX + cursor.canvasX * canvas.scale;
        const screenY = canvas.offsetY + cursor.canvasY * canvas.scale;

        return (
          <div
            key={cursor.userId}
            className="pointer-events-none absolute"
            style={{ left: screenX, top: screenY }}
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

