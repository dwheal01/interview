import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { LocalUser } from '../types';
import { statePersistence } from '../services/statePersistence';

type UserSessionContextType = {
  localUser: LocalUser | null;
  showUsernameModal: boolean;
  setShowUsernameModal: (show: boolean) => void;
  handleJoin: (username: string) => void;
};

const UserSessionContext = createContext<UserSessionContextType | null>(null);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Initialize local user from state persistence service
  useEffect(() => {
    const persisted = statePersistence.loadUserSession();
    if (persisted) {
      setLocalUser(persisted);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

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

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within UserSessionProvider');
  }
  return context;
}

