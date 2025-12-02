/**
 * Application-wide constants
 */

// Note dimensions
export const NOTE_WIDTH = 176; // w-44 in pixels (44 * 4 = 176)
export const NOTE_HEIGHT = 176; // h-44 in pixels

// UI dimensions
export const TOOLBAR_HEIGHT = 56; // h-14 in pixels (14 * 4 = 56)

// Canvas constraints
export const MIN_SCALE = 0.3;
export const MAX_SCALE = 2.0;
export const DEFAULT_SCALE = 1.0;

// Zoom factors
export const ZOOM_IN_FACTOR = 1.1; // Zoom in multiplier
export const ZOOM_OUT_FACTOR = 0.9; // Zoom out multiplier

// Canvas padding
export const CANVAS_PADDING = 40;

// Background grid
export const GRID_SIZE = 20; // Background grid size in pixels

// Trash bin
export const TRASH_SIZE = 48; // w-12 h-12 in pixels (12 * 4 = 48)
export const TRASH_MARGIN = 16; // bottom-4 right-4 in pixels (4 * 4 = 16)

// Interaction thresholds
export const DRAG_THRESHOLD_PX = 3; // Minimum distance to start dragging

// Cursor display
export const CURSOR_SIZE = 12; // w-3 h-3 in pixels (3 * 4 = 12)
export const CURSOR_LABEL_MARGIN_LEFT = 16; // ml-4 in pixels (4 * 4 = 16)
export const CURSOR_LABEL_MARGIN_TOP = -12; // -mt-3 in pixels (-3 * 4 = -12)
export const CURSOR_LABEL_FONT_SIZE = 10; // text-[10px] in pixels

// Textarea
export const TEXTAREA_MIN_HEIGHT = '1.5rem'; // Minimum height for auto-resizing textarea

// Storage keys
export const STORAGE_KEY_CANVAS = "sticky-board-canvas";

// Timing constants
export const BLUR_DELAY_MS = 100; // Delay for blur handler to allow focus movement
export const CURSOR_THROTTLE_MS = 100; // Throttle cursor updates to reduce Firestore writes
export const CURSOR_TIMEOUT_MS = 10_000; // Time before cursor is considered inactive
export const PRESENCE_HEARTBEAT_MS = 15_000; // Interval for presence heartbeat updates

