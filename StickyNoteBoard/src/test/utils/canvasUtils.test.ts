import { describe, it, expect } from 'vitest';
import type { CanvasTransform } from '../../types';

// These are utility functions that should be extracted from components
// Testing them as they would be used

describe('Canvas Coordinate Transformations', () => {
  const canvas: CanvasTransform = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };

  describe('screenToCanvas', () => {
    it('should convert screen coordinates to canvas coordinates at scale 1', () => {
      // At scale 1, no offset, center at (400, 300)
      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const screenX = 500; // 100px right of center
      const screenY = 400; // 100px below center

      const canvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
      const canvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;

      expect(canvasX).toBe(100);
      expect(canvasY).toBe(100);
    });

    it('should account for offset', () => {
      const canvasWithOffset: CanvasTransform = {
        scale: 1,
        offsetX: 50,
        offsetY: 30,
      };

      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const screenX = 500;
      const screenY = 400;

      const canvasX = (screenX - centerX - canvasWithOffset.offsetX) / canvasWithOffset.scale;
      const canvasY = (screenY - centerY - canvasWithOffset.offsetY) / canvasWithOffset.scale;

      expect(canvasX).toBe(50); // 100 - 50 offset
      expect(canvasY).toBe(70); // 100 - 30 offset
    });

    it('should account for zoom scale', () => {
      const canvasZoomed: CanvasTransform = {
        scale: 2,
        offsetX: 0,
        offsetY: 0,
      };

      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const screenX = 500; // 100px right of center
      const screenY = 400; // 100px below center

      const canvasX = (screenX - centerX - canvasZoomed.offsetX) / canvasZoomed.scale;
      const canvasY = (screenY - centerY - canvasZoomed.offsetY) / canvasZoomed.scale;

      expect(canvasX).toBe(50); // 100 / 2 scale
      expect(canvasY).toBe(50);
    });
  });

  describe('canvasToScreen', () => {
    it('should convert canvas coordinates to screen coordinates', () => {
      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const canvasX = 100;
      const canvasY = 100;

      const screenX = centerX + canvas.offsetX + canvasX * canvas.scale;
      const screenY = centerY + canvas.offsetY + canvasY * canvas.scale;

      expect(screenX).toBe(500); // 400 + 0 + 100
      expect(screenY).toBe(400); // 300 + 0 + 100
    });

    it('should account for offset', () => {
      const canvasWithOffset: CanvasTransform = {
        scale: 1,
        offsetX: 50,
        offsetY: 30,
      };

      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const canvasX = 100;
      const canvasY = 100;

      const screenX = centerX + canvasWithOffset.offsetX + canvasX * canvasWithOffset.scale;
      const screenY = centerY + canvasWithOffset.offsetY + canvasY * canvasWithOffset.scale;

      expect(screenX).toBe(550); // 400 + 50 + 100
      expect(screenY).toBe(430); // 300 + 30 + 100
    });

    it('should account for zoom scale', () => {
      const canvasZoomed: CanvasTransform = {
        scale: 2,
        offsetX: 0,
        offsetY: 0,
      };

      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const canvasX = 100;
      const canvasY = 100;

      const screenX = centerX + canvasZoomed.offsetX + canvasX * canvasZoomed.scale;
      const screenY = centerY + canvasZoomed.offsetY + canvasY * canvasZoomed.scale;

      expect(screenX).toBe(600); // 400 + 0 + 200
      expect(screenY).toBe(500); // 300 + 0 + 200
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain coordinates through round-trip conversion', () => {
      const viewportWidth = 800;
      const viewportHeight = 600;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;

      const originalCanvasX = 150;
      const originalCanvasY = 200;

      // Canvas to screen
      const screenX = centerX + canvas.offsetX + originalCanvasX * canvas.scale;
      const screenY = centerY + canvas.offsetY + originalCanvasY * canvas.scale;

      // Screen back to canvas
      const convertedCanvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
      const convertedCanvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;

      expect(convertedCanvasX).toBeCloseTo(originalCanvasX, 5);
      expect(convertedCanvasY).toBeCloseTo(originalCanvasY, 5);
    });
  });
});

