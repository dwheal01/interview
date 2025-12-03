import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { LocalUser } from '../types';
import { statePersistence } from '../services/statePersistence';
import { UserSessionContext } from './userSessionContextDef';

export function UserSessionProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization to load from localStorage during initial render
  // This avoids calling setState synchronously in an effect
  const [localUser, setLocalUser] = useState<LocalUser | null>(() => {
    return statePersistence.loadUserSession();
  });
  const [showUsernameModal, setShowUsernameModal] = useState(() => {
    return !statePersistence.loadUserSession();
  });

  const handleJoin = useCallback((username: string) => {
    // Generate user ID and color
    const userId = crypto.randomUUID?.() ?? String(Date.now());
    const colors: LocalUser['color'][] = ['yellow', 'pink', 'blue', 'green'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const user: LocalUser = {
      userId,
      username,
      color,
    };

    // Save to localStorage via state persistence service
    statePersistence.saveUserSession(userId, username, color);
    setLocalUser(user);
    setShowUsernameModal(false);
  }, []);

  return (
    <UserSessionContext.Provider
      value={{
        localUser,
        showUsernameModal,
        setShowUsernameModal,
        handleJoin,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

// Hook moved to hooks/useUserSession.ts to satisfy Fast Refresh requirements

