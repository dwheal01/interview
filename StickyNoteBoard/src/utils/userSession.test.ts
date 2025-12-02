import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLocalUser, createLocalUser } from './userSession';
import { setupLocalStorageMock, clearLocalStorageMock } from '../test/mocks/localStorage';

describe('userSession', () => {
  beforeEach(() => {
    clearLocalStorageMock();
    setupLocalStorageMock();
  });

  describe('getLocalUser', () => {
    it('should return null when no user data exists', () => {
      const user = getLocalUser();
      expect(user).toBeNull();
    });

    it('should return null when userId is missing', () => {
      localStorage.setItem('sticky-username', 'Test User');
      localStorage.setItem('sticky-user-color', '#f97316');
      const user = getLocalUser();
      expect(user).toBeNull();
    });

    it('should return null when username is missing', () => {
      localStorage.setItem('sticky-user-id', 'user-123');
      localStorage.setItem('sticky-user-color', '#f97316');
      const user = getLocalUser();
      expect(user).toBeNull();
    });

    it('should return null when color is missing', () => {
      localStorage.setItem('sticky-user-id', 'user-123');
      localStorage.setItem('sticky-username', 'Test User');
      const user = getLocalUser();
      expect(user).toBeNull();
    });

    it('should return user when all data exists', () => {
      localStorage.setItem('sticky-user-id', 'user-123');
      localStorage.setItem('sticky-username', 'Test User');
      localStorage.setItem('sticky-user-color', '#f97316');
      
      const user = getLocalUser();
      expect(user).toEqual({
        userId: 'user-123',
        username: 'Test User',
        color: '#f97316',
      });
    });
  });

  describe('createLocalUser', () => {
    it('should create a new user with generated userId when none exists', () => {
      const user = createLocalUser('New User');
      
      expect(user).toMatchObject({
        username: 'New User',
      });
      expect(user.userId).toBeDefined();
      expect(user.color).toBeDefined();
      expect(localStorage.getItem('sticky-user-id')).toBe(user.userId);
      expect(localStorage.getItem('sticky-username')).toBe('New User');
      expect(localStorage.getItem('sticky-user-color')).toBe(user.color);
    });

    it('should reuse existing userId when one exists', () => {
      const existingUserId = 'existing-user-123';
      localStorage.setItem('sticky-user-id', existingUserId);
      
      const user = createLocalUser('Updated User');
      
      expect(user.userId).toBe(existingUserId);
      expect(localStorage.getItem('sticky-user-id')).toBe(existingUserId);
    });

    it('should reuse existing color when one exists', () => {
      const existingColor = '#3b82f6';
      localStorage.setItem('sticky-user-color', existingColor);
      
      const user = createLocalUser('New User');
      
      expect(user.color).toBe(existingColor);
    });

    it('should assign a random color when none exists', () => {
      const user = createLocalUser('New User');
      
      expect(user.color).toBeDefined();
      expect(user.color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should update username even when user exists', () => {
      localStorage.setItem('sticky-user-id', 'user-123');
      localStorage.setItem('sticky-username', 'Old Name');
      
      const user = createLocalUser('New Name');
      
      expect(user.username).toBe('New Name');
      expect(localStorage.getItem('sticky-username')).toBe('New Name');
    });

    it('should generate userId using crypto.randomUUID when available', () => {
      const mockUUID = 'test-uuid-123';
      const originalRandomUUID = crypto.randomUUID;
      crypto.randomUUID = vi.fn(() => mockUUID);
      
      const user = createLocalUser('Test User');
      
      expect(user.userId).toBe(mockUUID);
      expect(crypto.randomUUID).toHaveBeenCalled();
      
      crypto.randomUUID = originalRandomUUID;
    });

    it('should fallback to Date.now() when crypto.randomUUID is not available', () => {
      const originalRandomUUID = crypto.randomUUID;
      // @ts-ignore
      delete crypto.randomUUID;
      
      const user = createLocalUser('Test User');
      
      expect(user.userId).toBeDefined();
      expect(typeof user.userId).toBe('string');
      
      crypto.randomUUID = originalRandomUUID;
    });
  });
});

