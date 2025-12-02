import type { CanvasTransform } from '../types';
import { TOOLBAR_HEIGHT } from '../constants';

/**
 * Converts screen coordinates to canvas coordinates
 * @param clientX - Screen X coordinate
 * @param clientY - Screen Y coordinate
 * @param canvas - Current canvas transform
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height (excluding toolbar)
 * @returns Canvas coordinates {x, y}
 */
export function screenToCanvas(
  clientX: number,
  clientY: number,
  canvas: CanvasTransform,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight - TOOLBAR_HEIGHT
): { x: number; y: number } {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  const screenX = clientX;
  const screenY = clientY - TOOLBAR_HEIGHT;
  
  const canvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
  const canvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;
  
  return { x: canvasX, y: canvasY };
}

/**
 * Converts canvas coordinates to screen coordinates
 * @param canvasX - Canvas X coordinate
 * @param canvasY - Canvas Y coordinate
 * @param canvas - Current canvas transform
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height (excluding toolbar)
 * @returns Screen coordinates {x, y}
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  canvas: CanvasTransform,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight - TOOLBAR_HEIGHT
): { x: number; y: number } {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  const screenX = centerX + canvas.offsetX + canvasX * canvas.scale;
  const screenY = centerY + canvas.offsetY + canvasY * canvas.scale;
  
  return { x: screenX, y: screenY };
}

