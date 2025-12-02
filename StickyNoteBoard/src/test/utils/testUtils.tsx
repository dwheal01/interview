import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper to wait for async updates
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to create mock note
export function createMockNote(overrides?: Partial<any>) {
  return {
    id: 'test-note-1',
    title: 'Test Note',
    content: 'Test content',
    x: 100,
    y: 100,
    color: 'yellow' as const,
    zIndex: 1,
    updatedAt: Date.now(),
    ...overrides,
  };
}

// Helper to create mock user
export function createMockUser(overrides?: Partial<any>) {
  return {
    userId: 'test-user-1',
    username: 'Test User',
    color: '#f97316',
    ...overrides,
  };
}

// Helper to create mock lock
export function createMockLock(overrides?: Partial<any>) {
  return {
    noteId: 'test-note-1',
    userId: 'test-user-1',
    username: 'Test User',
    userColor: '#f97316',
    lockedAt: Date.now(),
    ...overrides,
  };
}

// Mock window.innerWidth and innerHeight
export function mockWindowSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

// Mock getBoundingClientRect
export function mockGetBoundingClientRect(rect: Partial<DOMRect>) {
  const defaultRect: DOMRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    toJSON: () => {},
    ...rect,
  };

  return vi.fn(() => defaultRect);
}

