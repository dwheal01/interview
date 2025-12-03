import type { CanvasTransform } from '../types';
import { TOOLBAR_HEIGHT } from '../constants';

/**
 * Converts screen coordinates to canvas coordinates
 * Supports both viewport-based and element-based coordinate systems
 * @param clientX - Screen X coordinate (clientX from mouse event)
 * @param clientY - Screen Y coordinate (clientY from mouse event)
 * @param canvas - Current canvas transform
 * @param viewportWidth - Viewport width (optional, defaults to window.innerWidth)
 * @param viewportHeight - Viewport height excluding toolbar (optional, defaults to window.innerHeight - TOOLBAR_HEIGHT)
 * @param elementRect - Optional element bounding rect for element-relative coordinates
 * @returns Canvas coordinates {x, y}
 */
export function screenToCanvas(
  clientX: number,
  clientY: number,
  canvas: CanvasTransform,
  viewportWidth?: number,
  viewportHeight?: number,
  elementRect?: DOMRect
): { x: number; y: number } {
  let screenX: number;
  let screenY: number;
  let centerX: number;
  let centerY: number;

  if (elementRect) {
    // Element-relative coordinates (for use with getBoundingClientRect)
    screenX = clientX - elementRect.left;
    screenY = clientY - elementRect.top;
    centerX = elementRect.width / 2;
    centerY = elementRect.height / 2;
  } else {
    // Viewport-based coordinates
    const vpWidth = viewportWidth ?? window.innerWidth;
    const vpHeight = viewportHeight ?? window.innerHeight - TOOLBAR_HEIGHT;
    screenX = clientX;
    screenY = clientY - TOOLBAR_HEIGHT;
    centerX = vpWidth / 2;
    centerY = vpHeight / 2;
  }
  
  const canvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
  const canvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;
  
  return { x: canvasX, y: canvasY };
}

/**
 * Converts canvas coordinates to screen coordinates
 * Supports both viewport-based and element-based coordinate systems
 * @param canvasX - Canvas X coordinate
 * @param canvasY - Canvas Y coordinate
 * @param canvas - Current canvas transform
 * @param viewportWidth - Viewport width (optional, defaults to window.innerWidth)
 * @param viewportHeight - Viewport height excluding toolbar (optional, defaults to window.innerHeight - TOOLBAR_HEIGHT)
 * @param elementRect - Optional element bounding rect for element-relative coordinates
 * @returns Screen coordinates {x, y}
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  canvas: CanvasTransform,
  viewportWidth?: number,
  viewportHeight?: number,
  elementRect?: DOMRect
): { x: number; y: number } {
  let centerX: number;
  let centerY: number;

  if (elementRect) {
    // Element-relative coordinates
    centerX = elementRect.width / 2;
    centerY = elementRect.height / 2;
  } else {
    // Viewport-based coordinates
    const vpWidth = viewportWidth ?? window.innerWidth;
    const vpHeight = viewportHeight ?? window.innerHeight - TOOLBAR_HEIGHT;
    centerX = vpWidth / 2;
    centerY = vpHeight / 2;
  }
  
  const screenX = centerX + canvas.offsetX + canvasX * canvas.scale;
  const screenY = centerY + canvas.offsetY + canvasY * canvas.scale;
  
  return { x: screenX, y: screenY };
}

/**
 * Gets relative coordinates from a mouse event and element bounding rect
 * Extracts the common pattern of getting relative coordinates from getBoundingClientRect
 * @param clientX - Mouse event clientX
 * @param clientY - Mouse event clientY
 * @param elementRect - Element's bounding client rect
 * @returns Relative coordinates {x, y} and center {centerX, centerY}
 */
export function getRelativeCoordinates(
  clientX: number,
  clientY: number,
  elementRect: DOMRect
): { x: number; y: number; centerX: number; centerY: number } {
  const x = clientX - elementRect.left;
  const y = clientY - elementRect.top;
  const centerX = elementRect.width / 2;
  const centerY = elementRect.height / 2;
  return { x, y, centerX, centerY };
}

