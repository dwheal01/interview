import type { NoteDoc, CanvasTransform } from '../types';
import { NOTE_WIDTH, TRASH_SIZE, TRASH_MARGIN } from '../constants';
import { canvasToScreen } from './canvasUtils';
import { queryElementSafe } from './validation';

/**
 * Checks if a note overlaps with the trash bin
 * @param note - Note to check
 * @param canvas - Current canvas transform
 * @param boardRect - Bounding rectangle of the board element
 * @returns true if note overlaps with trash bin
 */
export function checkTrashOverlap(
  note: NoteDoc,
  canvas: CanvasTransform,
  boardRect: DOMRect
): boolean {
  // Calculate trash bin position in window coordinates
  const trashRight = window.innerWidth - TRASH_MARGIN;
  const trashBottom = window.innerHeight - TRASH_MARGIN;
  const trashLeft = trashRight - TRASH_SIZE;
  const trashTop = trashBottom - TRASH_SIZE;

  // Get note's screen position
  const screenPos = canvasToScreen(note.x, note.y, canvas);
  
  // Get actual note height (may be larger than NOTE_HEIGHT if content expanded)
  let noteHeight = NOTE_WIDTH; // Default height
  const noteElement = queryElementSafe(`[data-note-id="${note.id}"]`);
  if (noteElement) {
    const elementRect = noteElement.getBoundingClientRect();
    noteHeight = elementRect.height;
  }
  
  const noteWidth = NOTE_WIDTH * canvas.scale;
  const noteHeightScaled = noteHeight * canvas.scale;

  // Convert to window/client coordinates
  const noteRect = {
    left: boardRect.left + screenPos.x,
    top: boardRect.top + screenPos.y,
    right: boardRect.left + screenPos.x + noteWidth,
    bottom: boardRect.top + screenPos.y + noteHeightScaled,
  };

  const trashRect = {
    left: trashLeft,
    top: trashTop,
    right: trashRight,
    bottom: trashBottom,
  };

  // Check if rectangles overlap
  return !(
    noteRect.right < trashRect.left ||
    noteRect.left > trashRect.right ||
    noteRect.bottom < trashRect.top ||
    noteRect.top > trashRect.bottom
  );
}

