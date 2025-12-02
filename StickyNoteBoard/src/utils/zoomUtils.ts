import type { CanvasTransform } from '../types';
import { MIN_SCALE, MAX_SCALE, TOOLBAR_HEIGHT, DEFAULT_SCALE, NOTE_WIDTH, NOTE_HEIGHT, CANVAS_PADDING } from '../constants';

/**
 * Calculates new canvas transform after zooming
 * @param scaleFactor - Zoom factor (e.g., 1.1 for zoom in, 0.9 for zoom out)
 * @param screenX - Screen X coordinate of zoom center
 * @param screenY - Screen Y coordinate of zoom center
 * @param currentCanvas - Current canvas transform
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height (excluding toolbar)
 * @returns New canvas transform
 */
export function calculateZoom(
  scaleFactor: number,
  screenX: number,
  screenY: number,
  currentCanvas: CanvasTransform,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight - TOOLBAR_HEIGHT
): CanvasTransform {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  const prevScale = currentCanvas.scale;
  const worldX = (screenX - centerX - currentCanvas.offsetX) / prevScale;
  const worldY = (screenY - centerY - currentCanvas.offsetY) / prevScale;
  
  let newScale = prevScale * scaleFactor;
  newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
  
  const newOffsetX = screenX - centerX - worldX * newScale;
  const newOffsetY = screenY - centerY - worldY * newScale;
  
  return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
}

/**
 * Calculates canvas transform to fit all notes in viewport
 * @param notes - Array of notes with x, y positions
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height (excluding toolbar)
 * @returns Canvas transform that fits all notes
 */
export function calculateFitToView(
  notes: Array<{ x: number; y: number }>,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight - TOOLBAR_HEIGHT
): CanvasTransform {
  if (notes.length === 0) {
    return { scale: DEFAULT_SCALE, offsetX: 0, offsetY: 0 };
  }
  
  const minX = Math.min(...notes.map(n => n.x));
  const maxX = Math.max(...notes.map(n => n.x + NOTE_WIDTH));
  const minY = Math.min(...notes.map(n => n.y));
  const maxY = Math.max(...notes.map(n => n.y + NOTE_HEIGHT));

  const padding = CANVAS_PADDING;
  const contentWidth = maxX - minX + padding * 2;
  const contentHeight = maxY - minY + padding * 2;

  const scaleX = (viewportWidth - padding * 2) / contentWidth;
  const scaleY = (viewportHeight - padding * 2) / contentHeight;
  const newScale = Math.min(scaleX, scaleY, MAX_SCALE);

  const centerCanvasX = (minX + maxX) / 2;
  const centerCanvasY = (minY + maxY) / 2;

  const newOffsetX = -centerCanvasX * newScale;
  const newOffsetY = -centerCanvasY * newScale;

  return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
}

